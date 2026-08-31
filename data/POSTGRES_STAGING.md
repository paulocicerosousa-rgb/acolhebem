# PostgreSQL de staging

Defina `DATABASE_URL` apenas no ambiente de staging. Aplicar `schema.sql`, executar `staging-import.mjs` com fixture e só então conectar um adaptador `pg` com transação/UPSERT. Produção continua no Google Sheets até reconciliação aprovada.
