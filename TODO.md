# Image Upload Fix - Vercel Blob Storage

## Completed
- [x] Install `@vercel/blob` package
- [x] Rewrite upload API (`/api/upload`) to use Vercel Blob instead of filesystem `writeFile`
- [x] Update `next.config.ts` to allow Vercel Blob image domains (`*.public.blob.vercel-storage.com`)
- [x] Create Vercel Blob Store in dashboard (user did this)

## Previous Work (Already Done)
- [x] Create `MultiImageUpload` component for products
- [x] Fix upload API to accept both `file` and `files` field names
- [x] Update Add Product page (`/admin/products/new`) to use MultiImageUpload
- [x] Update Edit Product page (`/admin/products/[id]`) to use MultiImageUpload
- [x] Banners, Testimonials, Stylists already use ImageUpload - no changes needed
- [x] Content Blocks, FAQ have no image fields - no changes needed

## Notes
- Upload API now uses `put()` / `del()` from `@vercel/blob` for cloud storage
- Vercel Blob URLs are public and served from `*.public.blob.vercel-storage.com`
- `BLOB_READ_WRITE_TOKEN` env var is auto-added when Blob Store is linked to project
- Response format unchanged: `{ success, data: { files: [{ url, filename, originalName, size }] } }`
- No changes needed to ImageUpload or MultiImageUpload components
