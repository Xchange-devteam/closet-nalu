import { createClient } from "@supabase/supabase-js";
import readline from "readline";

const supabase = createClient(
  "https://nsrgacuqcrygqdwersbk.supabase.co",
  "sb_publishable_1gr4qRUlF5iI9nkoc7RMzw_sIcGThb8"
);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("E-mail: ", (email) => {
  rl.question("Senha: ", async (senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      console.log("\n❌ ERRO REAL DO SUPABASE:");
      console.log("Mensagem:", error.message);
      console.log("Status:", error.status);
      console.log("Code:", error.code);
    } else {
      console.log("\n✅ Login funcionou!");
      console.log("Usuário:", data.user.email);
      console.log("Email confirmado em:", data.user.email_confirmed_at);
    }
    rl.close();
    process.exit(0);
  });
});
