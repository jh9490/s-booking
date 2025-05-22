import { baseUrl } from "@/config/config";

export const getTechnicians = async (accessToken: string) => {
  const res = await fetch(
    `${baseUrl}/items/profile?filter[profile_type][_eq]=technician&fields=id,user.first_name`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const json = await res.json();
  console.log(json); 
  if (!res.ok || json.errors) throw new Error("Failed to fetch technicians");
  return json.data;
};