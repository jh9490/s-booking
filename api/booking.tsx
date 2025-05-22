// File: api/bookings.ts
import { baseUrl } from "@/config/config";

export const createBooking = async (
  payload: {
    request: number;
    technician: number;
    time_slot: string;
    date: string;
  },
  accessToken: string
) => {

  const res = await fetch(`${baseUrl}/items/booking`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok || json.errors) throw new Error("Booking creation failed");
  return json.data;
};


export const getTechnicianBookings = async (technicianId: number, accessToken: string) => {
  const res = await fetch(
    `${baseUrl}/items/booking?fields=id,time_slot,date,technician_notes,request.*,technician.id,request.service.title,request.profile.*,request.profile.user.first_name&filter[technician][_eq]=${technicianId}&filter[request][status][_eq]=scheduled`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const json = await res.json();
  console.log(json);
  if (!res.ok || json.errors) throw new Error("Failed to fetch technician bookings");
  return json.data;
};



export const updateBookingNotes = async (
  bookingId: number,
  notes: string,
  token: string
) => {
  const res = await fetch(`${baseUrl}/items/booking/${bookingId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      technician_notes: notes,
    }),
  });

  const json = await res.json();
  if (!res.ok || json.errors) throw new Error("Failed to update booking notes");
  return json.data;
};
