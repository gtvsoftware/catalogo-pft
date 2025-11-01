BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[produtos_base] (
    [id] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [produto_base] NVARCHAR(1000) NOT NULL,
    [tipo_produto] NVARCHAR(1000) NOT NULL,
    [descricao] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [produtos_base_status_df] DEFAULT 'ATIVO',
    [galeria_principal] NVARCHAR(max),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [produtos_base_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [produtos_base_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [produtos_base_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[conjuntos_comerciais] (
    [id] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [produto_id] NVARCHAR(1000) NOT NULL,
    [variedade] NVARCHAR(1000),
    [nivel_comercial] NVARCHAR(1000),
    [tipo_produto] NVARCHAR(1000) NOT NULL,
    [tipo_embalagem] NVARCHAR(1000) NOT NULL,
    [numero_pote] NVARCHAR(1000),
    [numero_hastes] NVARCHAR(1000),
    [numero_flores] NVARCHAR(1000),
    [altura_cm] NVARCHAR(1000),
    [diametro_flor_cm] NVARCHAR(1000),
    [cor] NVARCHAR(1000),
    [codigo_veiling] NVARCHAR(1000),
    [descricao_comercial] NVARCHAR(1000) NOT NULL,
    [descricao_original] NVARCHAR(1000) NOT NULL,
    [preco_venda_sugerido] INT NOT NULL CONSTRAINT [conjuntos_comerciais_preco_venda_sugerido_df] DEFAULT 0,
    [historico_precos] NVARCHAR(max),
    [imagens] NVARCHAR(max),
    [ativo] BIT NOT NULL CONSTRAINT [conjuntos_comerciais_ativo_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [conjuntos_comerciais_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [conjuntos_comerciais_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [conjuntos_comerciais_slug_key] UNIQUE NONCLUSTERED ([slug]),
    CONSTRAINT [conjuntos_comerciais_codigo_veiling_key] UNIQUE NONCLUSTERED ([codigo_veiling])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [produtos_base_produto_base_idx] ON [dbo].[produtos_base]([produto_base]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [produtos_base_tipo_produto_idx] ON [dbo].[produtos_base]([tipo_produto]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [produtos_base_status_idx] ON [dbo].[produtos_base]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [conjuntos_comerciais_produto_id_idx] ON [dbo].[conjuntos_comerciais]([produto_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [conjuntos_comerciais_tipo_produto_idx] ON [dbo].[conjuntos_comerciais]([tipo_produto]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [conjuntos_comerciais_tipo_embalagem_idx] ON [dbo].[conjuntos_comerciais]([tipo_embalagem]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [conjuntos_comerciais_numero_pote_idx] ON [dbo].[conjuntos_comerciais]([numero_pote]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [conjuntos_comerciais_altura_cm_idx] ON [dbo].[conjuntos_comerciais]([altura_cm]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [conjuntos_comerciais_cor_idx] ON [dbo].[conjuntos_comerciais]([cor]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [conjuntos_comerciais_codigo_veiling_idx] ON [dbo].[conjuntos_comerciais]([codigo_veiling]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [conjuntos_comerciais_ativo_idx] ON [dbo].[conjuntos_comerciais]([ativo]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [conjuntos_comerciais_descricao_comercial_idx] ON [dbo].[conjuntos_comerciais]([descricao_comercial]);

-- AddForeignKey
ALTER TABLE [dbo].[conjuntos_comerciais] ADD CONSTRAINT [conjuntos_comerciais_produto_id_fkey] FOREIGN KEY ([produto_id]) REFERENCES [dbo].[produtos_base]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
