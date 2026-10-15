export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code = "APP_ERROR") {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

type MySqlErrorLike = {
  code?: unknown;
  sqlMessage?: unknown;
  message?: unknown;
};

const MYSQL_MESSAGES: Record<string, string> = {
  ER_DUP_ENTRY: "Ya existe un registro con esos datos",
  ER_NO_REFERENCED_ROW_2: "Referencia inválida",
  ER_ROW_IS_REFERENCED_2: "El registro está en uso",
  ER_BAD_DB_ERROR: "La base de datos no existe",
  ER_NO_SUCH_TABLE: "Falta una tabla en la base de datos",
  ER_ACCESS_DENIED_ERROR: "Credenciales de base de datos inválidas",
  ECONNREFUSED: "No se pudo conectar a la base de datos",
  ETIMEDOUT: "Tiempo de espera agotado al conectar la base de datos",
};

function isMySqlError(error: unknown): error is MySqlErrorLike {
  return typeof error === "object" && error !== null && "code" in error;
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isMySqlError(error)) {
    const code = typeof error.code === "string" ? error.code : "";
    const friendly = MYSQL_MESSAGES[code];
    if (friendly) return new AppError(friendly, code);

    const message =
      typeof error.sqlMessage === "string" && error.sqlMessage
        ? error.sqlMessage
        : typeof error.message === "string" && error.message
          ? error.message
          : "Error de base de datos";
    return new AppError(message, code || "DB_ERROR");
  }

  if (error instanceof Error) return new AppError(error.message, "APP_ERROR");
  return new AppError("Error inesperado", "APP_ERROR");
}
