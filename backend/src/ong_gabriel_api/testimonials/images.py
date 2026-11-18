from io import BytesIO
from uuid import uuid4

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile, File
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_BYTES = 5 * 1024 * 1024
MAX_DIMENSION = 6000
OUTPUT_SIZE = 256
WEBP_QUALITY = 82
ALLOWED_FORMATS = frozenset({'JPEG', 'PNG', 'WEBP'})

# Pillow's decompression-bomb cap, set once. process_portrait also rejects
# dimensions above MAX_DIMENSION after reading the image header.
Image.MAX_IMAGE_PIXELS = MAX_DIMENSION * MAX_DIMENSION

ERROR_TOO_LARGE = 'O arquivo deve ter no máximo 5 MB.'
ERROR_INVALID = 'Envie uma imagem JPEG, PNG ou WebP.'
ERROR_DIMENSIONS = 'A imagem deve ter no máximo 6000x6000 pixels.'


def process_portrait(uploaded: File) -> ContentFile:
    payload = _read_limited(uploaded)
    try:
        with Image.open(BytesIO(payload)) as preview:
            fmt = preview.format
            width, height = preview.size
    except Image.DecompressionBombError as exc:
        raise ValidationError(ERROR_DIMENSIONS) from exc
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise ValidationError(ERROR_INVALID) from exc
    if fmt not in ALLOWED_FORMATS:
        raise ValidationError(ERROR_INVALID)
    if width > MAX_DIMENSION or height > MAX_DIMENSION or width < 1 or height < 1:
        raise ValidationError(ERROR_DIMENSIONS)
    try:
        with Image.open(BytesIO(payload)) as image:
            image.load()
            transposed = ImageOps.exif_transpose(image) or image
            squared = _center_crop_square(transposed)
            resized = squared.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.LANCZOS)
            converted = _webp_mode(resized)
            buffer = BytesIO()
            converted.save(
                buffer,
                format='WEBP',
                quality=WEBP_QUALITY,
                method=6,
                exif=b'',
                icc_profile=None,
            )
    except Image.DecompressionBombError as exc:
        raise ValidationError(ERROR_DIMENSIONS) from exc
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise ValidationError(ERROR_INVALID) from exc
    return ContentFile(buffer.getvalue(), name=f'{uuid4().hex}.webp')


def _read_limited(uploaded: File) -> bytes:
    size = getattr(uploaded, 'size', None)
    if size is not None and size > MAX_BYTES:
        raise ValidationError(ERROR_TOO_LARGE)
    uploaded.seek(0)
    payload = uploaded.read(MAX_BYTES + 1)
    uploaded.seek(0)
    if len(payload) > MAX_BYTES:
        raise ValidationError(ERROR_TOO_LARGE)
    if not payload:
        raise ValidationError(ERROR_INVALID)
    return payload


def _center_crop_square(image: Image.Image) -> Image.Image:
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return image.crop((left, top, left + side, top + side))


def _webp_mode(image: Image.Image) -> Image.Image:
    if image.mode in {'RGBA', 'LA'}:
        return image.convert('RGBA')
    if image.mode == 'P':
        if 'transparency' in image.info:
            return image.convert('RGBA')
        return image.convert('RGB')
    if image.mode != 'RGB':
        return image.convert('RGB')
    return image
