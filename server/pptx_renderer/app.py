"""
Microserviço de renderização PPTX (estilo Manus).

API:
- POST /render
  Body (JSON):
  {
    "templatePath": "C:/.../template.pptx",
    "deckTitle": "Título",
    "slides": [
      { "layout": "hero", "content": { "title": "...", "subtitle": "..." } },
      { "layout": "bullet", "content": { "title": "...", "items": [ { "text": "..."} ] } }
    ]
  }

Saída:
- PPTX final (application/vnd.openxmlformats-officedocument.presentationml.presentation)

NOTA: Este é um esqueleto. A lógica de mapeamento layout->slide/template
e substituição fina de conteúdo pode ser refinada depois.
"""

from io import BytesIO
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from pptx import Presentation


class SlideContent(BaseModel):
    layout: str
    content: dict


class RenderRequest(BaseModel):
    templatePath: str
    deckTitle: Optional[str] = None
    slides: List[SlideContent]


app = FastAPI(title="SlideDeck PPTX Renderer", version="0.1.0")


def _duplicate_slide(prs: Presentation, slide_layout_index: int):
    """
    Duplica um slide existente (por índice) de forma simples:
    - copia shapes (texto principalmente) para um novo slide em branco.
    Isto é propositalmente simples para primeira versão.
    """
    src = prs.slides[slide_layout_index]
    blank_layout = prs.slide_layouts[0]
    dest = prs.slides.add_slide(blank_layout)
    for shape in src.shapes:
        # Copiamos apenas caixas de texto simples; imagens/diagramas ficam para versões futuras.
        if not shape.has_text_frame:
            continue
        new_shape = dest.shapes.add_textbox(
            left=shape.left,
            top=shape.top,
            width=shape.width,
            height=shape.height,
        )
        new_tf = new_shape.text_frame
        new_tf.text = shape.text
    return dest


def _apply_content_to_slide(slide, layout: str, content: dict):
    """
    Versão inicial super simples:
    - hero/title: primeiro shape = título, segundo (se houver) = subtítulo.
    - bullet: primeiro shape = título, demais bullets concatenados em outro shape.
    - stats-row/big-number/quote: preenche linhas de texto.
    """
    text_shapes = [s for s in slide.shapes if s.has_text_frame]
    if not text_shapes:
        return

    def set_text(idx: int, value: str):
        if idx < len(text_shapes):
            tf = text_shapes[idx].text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = value or ""

    if layout in ("hero", "title", "title-subtitle", "title_subtitle"):
        set_text(0, content.get("title") or "")
        if layout != "title":
            set_text(1, content.get("subtitle") or "")
    elif layout == "bullet":
        set_text(0, content.get("title") or "")
        items = content.get("items") or []
        bullets = []
        for it in items:
            if isinstance(it, str):
                bullets.append(it)
            elif isinstance(it, dict):
                bullets.append(str(it.get("text") or ""))
        if len(text_shapes) > 1:
            tf = text_shapes[1].text_frame
            tf.clear()
            for line in bullets:
                p = tf.add_paragraph()
                p.text = line
    elif layout in ("stats-row", "stats_row", "big-number", "big_number", "quote"):
        # Preencher com texto concatenado simples para começar
        flat = []
        for key in sorted(content.keys()):
            val = content[key]
            if val:
                flat.append(str(val))
        set_text(0, " | ".join(flat))
    else:
        # Default: assume um slide com título apenas
        set_text(0, content.get("title") or "")


@app.post("/render")
def render_pptx(body: RenderRequest):
    try:
        prs = Presentation(body.templatePath)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Erro ao abrir template PPTX: {exc}") from exc

    if body.deckTitle:
        prs.core_properties.title = body.deckTitle

    # Estratégia inicial: usar o primeiro slide como base para todos,
    # e deixar o conteúdo ditar a diferença. Mais tarde pode mapear
    # hero/bullet/stats para slides específicos do template.
    base_index = 0

    # Remove todos os slides excepto o base para começarmos sempre limpo
    while len(prs.slides) > 1:
        r_id = prs.slides._sldIdLst[1].rId  # type: ignore[attr-defined]
        prs.part.drop_rel(r_id)
        del prs.slides._sldIdLst[1]  # type: ignore[attr-defined]

    # Para cada slide pedido: duplicar base e aplicar conteúdo
    for s in body.slides:
        slide = _duplicate_slide(prs, base_index)
        _apply_content_to_slide(slide, s.layout, s.content)

    # Remover o slide base original se não quisermos mantê-lo
    if prs.slides:
        r_id = prs.slides._sldIdLst[0].rId  # type: ignore[attr-defined]
        prs.part.drop_rel(r_id)
        del prs.slides._sldIdLst[0]  # type: ignore[attr-defined]

    buf = BytesIO()
    prs.save(buf)
    buf.seek(0)

    return Response(
        content=buf.read(),
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": 'attachment; filename="presentation.pptx"'},
    )


# Para correr localmente:
# uvicorn app:app --host 0.0.0.0 --port 5001 --reload

