import { baseUrl } from "@/config/config";

// File: /api/requests.ts
export const uploadFileToDirectus = async (uri: string, accessToken: string): Promise<string> => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'file.jpg';
    const type = filename.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
  
    formData.append("file", {
      uri,
      name: filename,
      type,
    } as any);
  
    const res = await fetch("http://localhost:8055/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
  
    
    const json = await res.json();
   
    if (!res.ok || json.errors) throw new Error("File upload failed");
    return json.data.id;
  };
  
  export const createRequest = async (
    payload: {
      service: number;
      profile: number;
      additional_details: string;
      files: any[] | any;
      prefered_date: string;
      prefered_time_slot: string;
    },
    accessToken: string
  ) => {
    
    const res = await fetch(`${baseUrl}/items/request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    const json = await res.json();
 
    if (!res.ok || json.errors) throw new Error("Request creation failed");
    return json.data;
  };
  


  export const getLastRequestByCustomer = async (customerId: number, accessToken: string) => {
    const url = `${baseUrl}/items/request?filter[profile][_eq]=${customerId}&filter[status][_eq]=done&filter[is_reviewed][_eq]=false&sort=-date_created&limit=1&fields=id,service.title,date_created,is_reviewed`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    const json = await res.json();

    if (!res.ok || json.errors) throw new Error("Failed to fetch last request");
  
    return json.data?.[0] ?? null;
  };


  export const submitReviewForRequest = async (
    requestId: number,
    rating: number,
    comment: string,
    accessToken: string
  ) => {
    const res = await fetch(`${baseUrl}/items/request/${requestId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        review_rating: rating,
        review_comment: comment,
        is_reviewed: true,
      }),
    });
  
    const json = await res.json();
    if (!res.ok || json.errors) throw new Error("Failed to submit review");
  
    return json.data;
  };
  

  export const getCustomerRequests = async (customerId: number, accessToken: string) => {
    const url = `${baseUrl}/items/request?filter[profile][_eq]=${customerId}&sort=-date_created&fields=id,service.title,status,date_updated`;
  
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  
    const json = await res.json();
    if (!res.ok || json.errors) throw new Error("Failed to fetch requests");
    return json.data || [];
  };
  

  export const getAllRequests = async (accessToken: string) => {
    const url = `${baseUrl}/items/request?fields=id,status,prefered_time_slot,prefered_date,profile.*,profile.user.*&sort=-date_created`;
  
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  
    const json = await res.json();
    if (!res.ok || json.errors) throw new Error("Failed to fetch all requests");
    return json.data || [];
  };
  

  export const getRequest = async (request_id : string ,accessToken: string) => {
    const url = `${baseUrl}/items/request?filter[id][_eq]=${request_id}&fields=*,files.directus_files_id.*,service.title,profile.*,profile.user.first_name,profile.user.last_name`;
  
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  
    const json = await res.json();
    
    if (!res.ok || json.errors) throw new Error("Failed to fetch all requests");
    return json.data || [];
  };


  export const updateRequestStatus = async (
    requestId: number,
    status: string,
    accessToken: string,
    bookingId?: number
  ) => {
    const payload: any = { status };
    if (bookingId) payload.booking = bookingId;
  
    const res = await fetch(`${baseUrl}/items/request/${requestId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    const json = await res.json();
    if (!res.ok || json.errors) throw new Error("Failed to update request");
    return json.data;
  };