-- Renomear tabelas do módulo COM360 para seguir a convenção de nomenclatura

-- Renomear tabelas de produtos para com360_ prefix
ALTER TABLE IF EXISTS product_cost_history RENAME TO com360_product_cost_history;
ALTER TABLE IF EXISTS product_suppliers RENAME TO com360_product_suppliers;
ALTER TABLE IF EXISTS product_files RENAME TO com360_product_files;
ALTER TABLE IF EXISTS product_notes RENAME TO com360_product_notes;
ALTER TABLE IF EXISTS product_packages RENAME TO com360_product_packages;
ALTER TABLE IF EXISTS product_images RENAME TO com360_product_images;

-- Atualizar índices para product_cost_history
DROP INDEX IF EXISTS product_cost_history_product_id_idx;
CREATE INDEX IF NOT EXISTS com360_product_cost_history_product_id_idx ON com360_product_cost_history (product_id);

-- Atualizar índices para product_suppliers
DROP INDEX IF EXISTS product_suppliers_product_idx;
DROP INDEX IF EXISTS product_suppliers_supplier_idx;
DROP INDEX IF EXISTS product_suppliers_primary_idx;
DROP INDEX IF EXISTS product_suppliers_active_idx;

CREATE INDEX IF NOT EXISTS com360_product_suppliers_product_idx ON com360_product_suppliers (product_id);
CREATE INDEX IF NOT EXISTS com360_product_suppliers_supplier_idx ON com360_product_suppliers (supplier_id);
CREATE INDEX IF NOT EXISTS com360_product_suppliers_primary_idx ON com360_product_suppliers (is_primary);
CREATE INDEX IF NOT EXISTS com360_product_suppliers_active_idx ON com360_product_suppliers (active);

-- Atualizar índices para product_files
DROP INDEX IF EXISTS product_files_product_idx;
DROP INDEX IF EXISTS product_files_type_idx;
DROP INDEX IF EXISTS product_files_main_image_idx;

CREATE INDEX IF NOT EXISTS com360_product_files_product_idx ON com360_product_files (product_id);
CREATE INDEX IF NOT EXISTS com360_product_files_type_idx ON com360_product_files (file_type);
CREATE INDEX IF NOT EXISTS com360_product_files_main_image_idx ON com360_product_files (is_main_image);

-- Atualizar índices para product_notes
DROP INDEX IF EXISTS product_notes_product_idx;
DROP INDEX IF EXISTS product_notes_important_idx;
DROP INDEX IF EXISTS product_notes_created_idx;

CREATE INDEX IF NOT EXISTS com360_product_notes_product_idx ON com360_product_notes (product_id);
CREATE INDEX IF NOT EXISTS com360_product_notes_important_idx ON com360_product_notes (is_important);
CREATE INDEX IF NOT EXISTS com360_product_notes_created_idx ON com360_product_notes (created_at);

-- Atualizar índices para product_packages
DROP INDEX IF EXISTS product_packages_product_idx;
DROP INDEX IF EXISTS product_packages_number_idx;

CREATE INDEX IF NOT EXISTS com360_product_packages_product_idx ON com360_product_packages (product_id);
CREATE INDEX IF NOT EXISTS com360_product_packages_number_idx ON com360_product_packages (package_number);

-- Atualizar índices para product_images
DROP INDEX IF EXISTS product_images_product_idx;
DROP INDEX IF EXISTS product_images_position_idx;
DROP INDEX IF EXISTS product_images_created_idx;

CREATE INDEX IF NOT EXISTS com360_product_images_product_idx ON com360_product_images (product_id);
CREATE INDEX IF NOT EXISTS com360_product_images_position_idx ON com360_product_images (product_id, position);
CREATE INDEX IF NOT EXISTS com360_product_images_created_idx ON com360_product_images (created_at);