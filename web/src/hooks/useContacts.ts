"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { Contact } from "@/types";

interface UseContactsOptions {
  search?: string;
  status?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export function useContacts({
  search,
  status,
  tag,
  page = 0,
  pageSize = 50,
}: UseContactsOptions = {}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = getBrowserSupabase();

  const loadContacts = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("contacts")
      .select("*", { count: "exact" })
      .order("last_message_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,wa_id.ilike.%${search}%`
      );
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data, count } = await query;
    setContacts((data as unknown as Contact[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [supabase, search, status, tag, page, pageSize]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  return { contacts, total, loading, refresh: loadContacts };
}
