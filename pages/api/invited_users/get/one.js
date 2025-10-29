import client from "../../../../lib/supabaseClient";

export const config = {
  api: {
    bodyParser: true,
  },
};


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  const { data, error } = await client
    .from("invited_users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  

  if (!data) {
    return res.status(404).json({ error: "Invite not found" });
  }

  return res.status(200).json(data);
}
