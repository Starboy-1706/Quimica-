/** Contrato común de las Server Actions consumidas con useActionState. */

export type ActionState = {
  status: "idle" | "success" | "error";
  error: string | null;
};

export const idleActionState: ActionState = { status: "idle", error: null };

export function actionError(error: string): ActionState {
  return { status: "error", error };
}

export function actionSuccess(): ActionState {
  return { status: "success", error: null };
}
