# products.py  -- example FastAPI routes for the shop frontend.
#
# Install once:   pip install python-multipart
#
# In your main.py add:
#     from fastapi.staticfiles import StaticFiles
#     from pathlib import Path
#     from products import router as products_router
#
#     Path("uploads").mkdir(exist_ok=True)
#     app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
#     app.include_router(products_router)
#
# (Your CORS settings must already allow http://localhost:5173 - login works, so they do.)

import uuid
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter(prefix="/products", tags=["products"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_SIZE = 2 * 1024 * 1024  # 2 MB

# TEMPORARY storage so you can test the frontend right away.
# Replace this list with your real database table (same fields).
PRODUCTS: list[dict] = []


@router.get("")
def list_products():
    return PRODUCTS


@router.get("/{product_id}")
def get_product(product_id: int):
    for p in PRODUCTS:
        if p["id"] == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


@router.post("", status_code=201)
async def create_product(
    name: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    image: UploadFile = File(...),
):
    # 1. check the file is a real image type and not too big
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG or WEBP images are allowed")
    content = await image.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Image must be smaller than 2 MB")

    # 2. save the file on disk with a random name (never trust the user's file name)
    filename = f"{uuid.uuid4().hex}{ALLOWED_TYPES[image.content_type]}"
    (UPLOAD_DIR / filename).write_bytes(content)

    # 3. save only the PATH in the database, not the image itself
    product = {
        "id": len(PRODUCTS) + 1,          # with a real DB, the DB gives the id
        "name": name,
        "price": price,
        "stock": stock,
        "category": category,
        "description": description,
        "image_url": f"/uploads/{filename}",
    }
    PRODUCTS.append(product)
    return product
