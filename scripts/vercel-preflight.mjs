const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "OPENAI_API_KEY",
  "OPENAI_RESPONSES_MODEL",
  "OPENAI_EVALUATOR_MODEL",
  "OPENAI_EMBEDDING_MODEL",
  "NEXT_PUBLIC_SITE_URL"
];

const missing = requiredEnvVars.filter((name) => !process.env[name]?.trim());

console.log("AURUMGEN Vercel preflight");
console.log("");

if (missing.length > 0) {
  console.log("Missing environment variables:");
  for (const name of missing) {
    console.log(`- ${name}`);
  }
  console.log("");
} else {
  console.log("All required environment variables are present.");
  console.log("");
}

console.log("Remember to verify:");
console.log("- Supabase migrations are applied through 020_operational_activity_logs.sql");
console.log("- Supabase Auth Site URL points to the production domain");
console.log("- Supabase Redirect URLs include localhost, production, and preview Vercel URLs");
console.log("- Storage buckets 'materials' and 'ai-documents' exist in production");

process.exit(missing.length > 0 ? 1 : 0);
