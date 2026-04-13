export async function logOperationalEvent(
  supabase: any,
  input: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string | number;
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await supabase.from("operational_activity_logs").insert({
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: String(input.entityId),
    metadata: input.metadata ?? {}
  });

  if (error) {
    console.error("Failed to write operational activity log:", error.message);
  }
}
