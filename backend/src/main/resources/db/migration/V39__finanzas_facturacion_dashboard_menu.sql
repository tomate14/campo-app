UPDATE menu_options
SET label = 'Facturacion y ventas',
    section = 'Finanzas',
    display_order = 500,
    updated_at = CURRENT_TIMESTAMP(6)
WHERE menu_key = 'finanzas-facturacion';

UPDATE menu_options
SET label = 'Dashboard financiero',
    section = 'Dashboard',
    display_order = 20,
    updated_at = CURRENT_TIMESTAMP(6)
WHERE menu_key = 'finanzas-reportes';
