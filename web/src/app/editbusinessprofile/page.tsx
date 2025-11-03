"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

type DayConfig = {
  closed: boolean;
  from: string; // "09:00 AM"
  to: string; // "06:00 PM"
};

type HoursState = Record<DayKey, DayConfig>;

const DAY_LABELS: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

const DAY_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function to24h(s12: string): string {
  const [time, mer] = s12.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mer === "PM" && h < 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function from24h(s24: string): string {
  const [hstr, m] = s24.split(":");
  let h = Number(hstr);
  const mer = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${m} ${mer}`;
}

function buildTimeOptions(stepMinutes = 30): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const mer = h >= 12 ? "PM" : "AM";
      let hr = h % 12;
      if (hr === 0) hr = 12;
      out.push(`${String(hr).padStart(2, "0")}:${String(m).padStart(2, "0")} ${mer}`);
    }
  }
  return out;
}

const DEFAULT_HOURS: HoursState = {
  mon: { closed: false, from: "09:00 AM", to: "06:00 PM" },
  tue: { closed: false, from: "09:00 AM", to: "06:00 PM" },
  wed: { closed: false, from: "09:00 AM", to: "06:00 PM" },
  thu: { closed: false, from: "09:00 AM", to: "06:00 PM" },
  fri: { closed: false, from: "09:00 AM", to: "06:00 PM" },
  sat: { closed: false, from: "10:00 AM", to: "02:00 PM" },
  sun: { closed: true, from: "09:00 AM", to: "06:00 PM" },
};

/* === Country code list (expanded to include essentially all countries/territories) === */
const COUNTRY_CODES: { dial: string; label: string }[] = [
  { dial: "+93", label: "Afghanistan (+93)" },
  { dial: "+355", label: "Albania (+355)" },
  { dial: "+213", label: "Algeria (+213)" },
  { dial: "+1684", label: "American Samoa (+1684)" },
  { dial: "+376", label: "Andorra (+376)" },
  { dial: "+244", label: "Angola (+244)" },
  { dial: "+1264", label: "Anguilla (+1264)" },
  { dial: "+1268", label: "Antigua and Barbuda (+1268)" },
  { dial: "+54", label: "Argentina (+54)" },
  { dial: "+374", label: "Armenia (+374)" },
  { dial: "+297", label: "Aruba (+297)" },
  { dial: "+61", label: "Australia (+61)" },
  { dial: "+43", label: "Austria (+43)" },
  { dial: "+994", label: "Azerbaijan (+994)" },
  { dial: "+1242", label: "Bahamas (+1242)" },
  { dial: "+973", label: "Bahrain (+973)" },
  { dial: "+880", label: "Bangladesh (+880)" },
  { dial: "+1246", label: "Barbados (+1246)" },
  { dial: "+375", label: "Belarus (+375)" },
  { dial: "+32", label: "Belgium (+32)" },
  { dial: "+501", label: "Belize (+501)" },
  { dial: "+229", label: "Benin (+229)" },
  { dial: "+1441", label: "Bermuda (+1441)" },
  { dial: "+975", label: "Bhutan (+975)" },
  { dial: "+591", label: "Bolivia (+591)" },
  { dial: "+599", label: "Bonaire, Sint Eustatius and Saba (+599)" },
  { dial: "+387", label: "Bosnia and Herzegovina (+387)" },
  { dial: "+267", label: "Botswana (+267)" },
  { dial: "+55", label: "Brazil (+55)" },
  { dial: "+246", label: "British Indian Ocean Territory (+246)" },
  { dial: "+673", label: "Brunei Darussalam (+673)" },
  { dial: "+359", label: "Bulgaria (+359)" },
  { dial: "+226", label: "Burkina Faso (+226)" },
  { dial: "+257", label: "Burundi (+257)" },
  { dial: "+238", label: "Cabo Verde (+238)" },
  { dial: "+855", label: "Cambodia (+855)" },
  { dial: "+237", label: "Cameroon (+237)" },
  { dial: "+1", label: "Canada (+1)" },
  { dial: "+1345", label: "Cayman Islands (+1345)" },
  { dial: "+236", label: "Central African Republic (+236)" },
  { dial: "+235", label: "Chad (+235)" },
  { dial: "+56", label: "Chile (+56)" },
  { dial: "+86", label: "China (+86)" },
  { dial: "+61", label: "Christmas Island (+61)" },
  { dial: "+61", label: "Cocos (Keeling) Islands (+61)" },
  { dial: "+57", label: "Colombia (+57)" },
  { dial: "+269", label: "Comoros (+269)" },
  { dial: "+242", label: "Congo (+242)" },
  { dial: "+243", label: "Congo, Democratic Republic of the (+243)" },
  { dial: "+682", label: "Cook Islands (+682)" },
  { dial: "+506", label: "Costa Rica (+506)" },
  { dial: "+225", label: "Côte d’Ivoire (+225)" },
  { dial: "+385", label: "Croatia (+385)" },
  { dial: "+53", label: "Cuba (+53)" },
  { dial: "+5999", label: "Curaçao (+5999)" },
  { dial: "+357", label: "Cyprus (+357)" },
  { dial: "+420", label: "Czechia (+420)" },
  { dial: "+45", label: "Denmark (+45)" },
  { dial: "+253", label: "Djibouti (+253)" },
  { dial: "+1767", label: "Dominica (+1767)" },
  { dial: "+1809", label: "Dominican Republic (+1 809/829/849)" },
  { dial: "+593", label: "Ecuador (+593)" },
  { dial: "+20", label: "Egypt (+20)" },
  { dial: "+503", label: "El Salvador (+503)" },
  { dial: "+240", label: "Equatorial Guinea (+240)" },
  { dial: "+291", label: "Eritrea (+291)" },
  { dial: "+372", label: "Estonia (+372)" },
  { dial: "+268", label: "Eswatini (+268)" },
  { dial: "+251", label: "Ethiopia (+251)" },
  { dial: "+500", label: "Falkland Islands (Malvinas) (+500)" },
  { dial: "+298", label: "Faroe Islands (+298)" },
  { dial: "+679", label: "Fiji (+679)" },
  { dial: "+358", label: "Finland (+358)" },
  { dial: "+33", label: "France (+33)" },
  { dial: "+594", label: "French Guiana (+594)" },
  { dial: "+689", label: "French Polynesia (+689)" },
  { dial: "+241", label: "Gabon (+241)" },
  { dial: "+220", label: "Gambia (+220)" },
  { dial: "+995", label: "Georgia (+995)" },
  { dial: "+49", label: "Germany (+49)" },
  { dial: "+233", label: "Ghana (+233)" },
  { dial: "+350", label: "Gibraltar (+350)" },
  { dial: "+30", label: "Greece (+30)" },
  { dial: "+299", label: "Greenland (+299)" },
  { dial: "+1473", label: "Grenada (+1473)" },
  { dial: "+590", label: "Guadeloupe (+590)" },
  { dial: "+1671", label: "Guam (+1671)" },
  { dial: "+502", label: "Guatemala (+502)" },
  { dial: "+44", label: "Guernsey (+44)" },
  { dial: "+224", label: "Guinea (+224)" },
  { dial: "+245", label: "Guinea-Bissau (+245)" },
  { dial: "+592", label: "Guyana (+592)" },
  { dial: "+509", label: "Haiti (+509)" },
  { dial: "+504", label: "Honduras (+504)" },
  { dial: "+852", label: "Hong Kong (+852)" },
  { dial: "+36", label: "Hungary (+36)" },
  { dial: "+354", label: "Iceland (+354)" },
  { dial: "+91", label: "India (+91)" },
  { dial: "+62", label: "Indonesia (+62)" },
  { dial: "+98", label: "Iran (+98)" },
  { dial: "+964", label: "Iraq (+964)" },
  { dial: "+353", label: "Ireland (+353)" },
  { dial: "+44", label: "Isle of Man (+44)" },
  { dial: "+972", label: "Israel (+972)" },
  { dial: "+39", label: "Italy (+39)" },
  { dial: "+1876", label: "Jamaica (+1876)" },
  { dial: "+81", label: "Japan (+81)" },
  { dial: "+44", label: "Jersey (+44)" },
  { dial: "+962", label: "Jordan (+962)" },
  { dial: "+7", label: "Kazakhstan (+7)" },
  { dial: "+254", label: "Kenya (+254)" },
  { dial: "+686", label: "Kiribati (+686)" },
  { dial: "+850", label: "Korea, Democratic People’s Republic (+850)" },
  { dial: "+82", label: "Korea, Republic of (+82)" },
  { dial: "+965", label: "Kuwait (+965)" },
  { dial: "+996", label: "Kyrgyzstan (+996)" },
  { dial: "+856", label: "Lao PDR (+856)" },
  { dial: "+371", label: "Latvia (+371)" },
  { dial: "+961", label: "Lebanon (+961)" },
  { dial: "+266", label: "Lesotho (+266)" },
  { dial: "+231", label: "Liberia (+231)" },
  { dial: "+218", label: "Libya (+218)" },
  { dial: "+423", label: "Liechtenstein (+423)" },
  { dial: "+370", label: "Lithuania (+370)" },
  { dial: "+352", label: "Luxembourg (+352)" },
  { dial: "+853", label: "Macao (+853)" },
  { dial: "+389", label: "North Macedonia (+389)" },
  { dial: "+261", label: "Madagascar (+261)" },
  { dial: "+265", label: "Malawi (+265)" },
  { dial: "+60", label: "Malaysia (+60)" },
  { dial: "+960", label: "Maldives (+960)" },
  { dial: "+223", label: "Mali (+223)" },
  { dial: "+356", label: "Malta (+356)" },
  { dial: "+692", label: "Marshall Islands (+692)" },
  { dial: "+596", label: "Martinique (+596)" },
  { dial: "+222", label: "Mauritania (+222)" },
  { dial: "+230", label: "Mauritius (+230)" },
  { dial: "+262", label: "Mayotte (+262)" },
  { dial: "+52", label: "Mexico (+52)" },
  { dial: "+691", label: "Micronesia, Federated States of (+691)" },
  { dial: "+373", label: "Moldova (+373)" },
  { dial: "+377", label: "Monaco (+377)" },
  { dial: "+976", label: "Mongolia (+976)" },
  { dial: "+382", label: "Montenegro (+382)" },
  { dial: "+1664", label: "Montserrat (+1664)" },
  { dial: "+212", label: "Morocco (+212)" },
  { dial: "+258", label: "Mozambique (+258)" },
  { dial: "+95", label: "Myanmar (+95)" },
  { dial: "+264", label: "Namibia (+264)" },
  { dial: "+674", label: "Nauru (+674)" },
  { dial: "+977", label: "Nepal (+977)" },
  { dial: "+31", label: "Netherlands (+31)" },
  { dial: "+687", label: "New Caledonia (+687)" },
  { dial: "+64", label: "New Zealand (+64)" },
  { dial: "+505", label: "Nicaragua (+505)" },
  { dial: "+227", label: "Niger (+227)" },
  { dial: "+234", label: "Nigeria (+234)" },
  { dial: "+683", label: "Niue (+683)" },
  { dial: "+672", label: "Norfolk Island (+672)" },
  { dial: "+1670", label: "Northern Mariana Islands (+1670)" },
  { dial: "+47", label: "Norway (+47)" },
  { dial: "+968", label: "Oman (+968)" },
  { dial: "+92", label: "Pakistan (+92)" },
  { dial: "+680", label: "Palau (+680)" },
  { dial: "+970", label: "Palestine, State of (+970)" },
  { dial: "+507", label: "Panama (+507)" },
  { dial: "+675", label: "Papua New Guinea (+675)" },
  { dial: "+595", label: "Paraguay (+595)" },
  { dial: "+51", label: "Peru (+51)" },
  { dial: "+63", label: "Philippines (+63)" },
  { dial: "+48", label: "Poland (+48)" },
  { dial: "+351", label: "Portugal (+351)" },
  { dial: "+1787", label: "Puerto Rico (+1787 / +1939)" },
  { dial: "+974", label: "Qatar (+974)" },
  { dial: "+262", label: "Réunion (+262)" },
  { dial: "+40", label: "Romania (+40)" },
  { dial: "+7", label: "Russian Federation (+7)" },
  { dial: "+250", label: "Rwanda (+250)" },
  { dial: "+590", label: "Saint Barthélemy (+590)" },
  { dial: "+290", label: "Saint Helena, Ascension and Tristan da Cunha (+290)" },
  { dial: "+1869", label: "Saint Kitts and Nevis (+1869)" },
  { dial: "+1758", label: "Saint Lucia (+1758)" },
  { dial: "+590", label: "Saint Martin (+590)" },
  { dial: "+508", label: "Saint Pierre and Miquelon (+508)" },
  { dial: "+1784", label: "Saint Vincent and the Grenadines (+1784)" },
  { dial: "+685", label: "Samoa (+685)" },
  { dial: "+378", label: "San Marino (+378)" },
  { dial: "+239", label: "Sao Tome and Principe (+239)" },
  { dial: "+966", label: "Saudi Arabia (+966)" },
  { dial: "+221", label: "Senegal (+221)" },
  { dial: "+381", label: "Serbia (+381)" },
  { dial: "+248", label: "Seychelles (+248)" },
  { dial: "+232", label: "Sierra Leone (+232)" },
  { dial: "+65", label: "Singapore (+65)" },
  { dial: "+1721", label: "Sint Maarten (+1721)" },
  { dial: "+421", label: "Slovakia (+421)" },
  { dial: "+386", label: "Slovenia (+386)" },
  { dial: "+677", label: "Solomon Islands (+677)" },
  { dial: "+252", label: "Somalia (+252)" },
  { dial: "+27", label: "South Africa (+27)" },
  { dial: "+211", label: "South Sudan (+211)" },
  { dial: "+34", label: "Spain (+34)" },
  { dial: "+94", label: "Sri Lanka (+94)" },
  { dial: "+249", label: "Sudan (+249)" },
  { dial: "+597", label: "Suriname (+597)" },
  { dial: "+47", label: "Svalbard and Jan Mayen (+47)" },
  { dial: "+46", label: "Sweden (+46)" },
  { dial: "+41", label: "Switzerland (+41)" },
  { dial: "+963", label: "Syrian Arab Republic (+963)" },
  { dial: "+886", label: "Taiwan (+886)" },
  { dial: "+992", label: "Tajikistan (+992)" },
  { dial: "+255", label: "Tanzania, United Republic of (+255)" },
  { dial: "+66", label: "Thailand (+66)" },
  { dial: "+670", label: "Timor-Leste (+670)" },
  { dial: "+228", label: "Togo (+228)" },
  { dial: "+690", label: "Tokelau (+690)" },
  { dial: "+676", label: "Tonga (+676)" },
  { dial: "+1868", label: "Trinidad and Tobago (+1868)" },
  { dial: "+216", label: "Tunisia (+216)" },
  { dial: "+90", label: "Türkiye (+90)" },
  { dial: "+993", label: "Turkmenistan (+993)" },
  { dial: "+1649", label: "Turks and Caicos Islands (+1649)" },
  { dial: "+688", label: "Tuvalu (+688)" },
  { dial: "+256", label: "Uganda (+256)" },
  { dial: "+380", label: "Ukraine (+380)" },
  { dial: "+971", label: "United Arab Emirates (+971)" },
  { dial: "+44", label: "United Kingdom (+44)" },
  { dial: "+1", label: "United States (+1)" },
  { dial: "+598", label: "Uruguay (+598)" },
  { dial: "+998", label: "Uzbekistan (+998)" },
  { dial: "+678", label: "Vanuatu (+678)" },
  { dial: "+58", label: "Venezuela (+58)" },
  { dial: "+84", label: "Viet Nam (+84)" },
  { dial: "+1284", label: "Virgin Islands, British (+1284)" },
  { dial: "+1340", label: "Virgin Islands, U.S. (+1340)" },
  { dial: "+681", label: "Wallis and Futuna (+681)" },
  { dial: "+212", label: "Western Sahara (+212)" },
  { dial: "+967", label: "Yemen (+967)" },
  { dial: "+260", label: "Zambia (+260)" },
  { dial: "+263", label: "Zimbabwe (+263)" },
];

/* Default dial suggestion from timezone (fallback only) */
function defaultDialFromTimezone(tz: string | null | undefined): string {
  if (!tz) return "+91";
  if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Calcutta")) return "+91";
  if (tz.startsWith("America/")) return "+1";
  if (tz.startsWith("Europe/London")) return "+44";
  if (tz.startsWith("Asia/Dubai")) return "+971";
  if (tz.startsWith("Asia/Singapore")) return "+65";
  if (tz.startsWith("Australia/")) return "+61";
  return "+91";
}

/* Parse an existing E.164 number into dial & local parts */
function splitE164(e164: string): { dial: string; local: string } {
  if (!e164) return { dial: "+91", local: "" };
  const normalized = e164.trim();
  if (!normalized.startsWith("+")) return { dial: "+91", local: normalized.replace(/\D+/g, "") };

  const onlyDigits = normalized.replace(/[^\d+]/g, "");
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (onlyDigits.startsWith(c.dial)) {
      return { dial: c.dial, local: onlyDigits.slice(c.dial.length) };
    }
  }
  const m3 = onlyDigits.match(/^\+(\d{3,4})(\d*)$/);
  if (m3) return { dial: `+${m3[1]}`, local: m3[2] };
  const m2 = onlyDigits.match(/^\+(\d{2})(\d*)$/);
  if (m2) return { dial: `+${m2[1]}`, local: m2[2] };
  const m1 = onlyDigits.match(/^\+(\d)(\d*)$/);
  if (m1) return { dial: `+${m1[1]}`, local: m1[2] };
  return { dial: "+91", local: onlyDigits.replace(/\D+/g, "") };
}

/* Combine dial & local into E.164 */
function combineE164(dial: string, local: string): string {
  const d = (dial || "+").replace(/[^\d+]/g, "");
  const l = (local || "").replace(/\D+/g, "");
  if (!d || d === "+") return l ? `+${l}` : "";
  return l ? `${d}${l}` : d;
}

export default function EditBusinessProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("");
  const [contactName, setContactName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Calcutta");
  const [hours, setHours] = useState<HoursState>(DEFAULT_HOURS);

  /* NEW: WhatsApp pieces */
  const [dial, setDial] = useState<string>("+91");
  const [localNumber, setLocalNumber] = useState<string>(""); // digits only UI

  const timeOptions = useMemo(() => buildTimeOptions(30), []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        router.push("/login?redirectedFrom=%2Feditbusinessprofile");
        return;
      }
      if (!mounted) return;

      setEmail(user.email ?? "");

      const { data: row, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (row) {
        setCompanyName(row.company_name ?? "");
        setCategory(row.category ?? "");
        setContactName(row.contact_name ?? "");
        setTimezone(row.timezone ?? "Asia/Calcutta");

        const e164 = row.whatsapp_e164 ?? "";
        if (e164) {
          const { dial: d, local } = splitE164(e164);
          setDial(d);
          setLocalNumber(local);
        } else {
          setDial(defaultDialFromTimezone(row.timezone));
          setLocalNumber("");
        }

        const wh = row.working_hours;
        if (wh && typeof wh === "object") {
          try {
            if (wh.mon && wh.tue) {
              const next: HoursState = { ...DEFAULT_HOURS };
              (Object.keys(next) as DayKey[]).forEach((d) => {
                const v = wh[d];
                if (v) {
                  next[d] = {
                    closed: !!v.closed,
                    from: v.from ? from24h(v.from) : DEFAULT_HOURS[d].from,
                    to: v.to ? from24h(v.to) : DEFAULT_HOURS[d].to,
                  };
                }
              });
              setHours(next);
            } else if (wh.mon_fri || wh.sat || wh.sun) {
              const parseRange = (s: string) => {
                const [a, b] = s.split("-");
                return {
                  from: from24h(a.length === 5 ? a : `${a}:00`),
                  to: from24h(b.length === 5 ? b : `${b}:00`),
                };
              };
              const next: HoursState = { ...DEFAULT_HOURS };
              if (wh.mon_fri) {
                const rng = parseRange(wh.mon_fri);
                ["mon", "tue", "wed", "thu", "fri"].forEach((d) => {
                  next[d as DayKey] = { closed: false, from: rng.from, to: rng.to };
                });
              }
              if (wh.sat) {
                const rng = parseRange(wh.sat);
                next.sat = { closed: false, from: rng.from, to: rng.to };
              }
              if (wh.sun === "off") {
                next.sun = { ...next.sun, closed: true };
              }
              setHours(next);
            }
          } catch {
            /* ignore */
          }
        } else {
          setDial(defaultDialFromTimezone("Asia/Calcutta"));
        }
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  async function onSave() {
    setSaving(true);
    setError(null);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      setSaving(false);
      router.push("/login?redirectedFrom=%2Feditbusinessprofile");
      return;
    }

    const working_hours = DAY_ORDER.reduce((acc, d) => {
      const v = hours[d];
      acc[d] = {
        closed: !!v.closed,
        from: to24h(v.from),
        to: to24h(v.to),
      };
      return acc;
    }, {} as any);

    const whatsapp_e164 = combineE164(dial, localNumber);

    const { data: existing, error: findErr } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (findErr) {
      setError(findErr.message);
      setSaving(false);
      return;
    }

    const payload = {
      owner_id: user.id,
      company_name: companyName || null,
      category: category || null,
      whatsapp_e164: whatsapp_e164 || null,
      contact_name: contactName || null,
      timezone: timezone || null,
      working_hours,
    };

    let upsertErr: any = null;

    if (existing?.id) {
      const { error } = await supabase
        .from("businesses")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
      upsertErr = error;
    } else {
      const { error } = await supabase.from("businesses").insert(payload).select().single();
      upsertErr = error;
    }

    if (upsertErr) {
      setError(upsertErr.message);
      setSaving(false);
      return;
    }

    router.push("/businessprofile");
  }

  async function onSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-300">Loading…</div>;
  }

  return (
    <div className="max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit business profile</h1>
        <div className="space-x-2">
          <button className="rounded border px-3 py-1" onClick={() => router.push("/dashboard")}>
            ← Back to dashboard
          </button>
          <button className="rounded border px-3 py-1" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>

      <p className="mb-4 text-sm text-green-400">
        Signed in as <span className="font-medium">{email}</span>.
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Business / company name</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded border bg-transparent px-3 py-2"
            placeholder="Acme Co."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border bg-transparent px-3 py-2"
            placeholder="e.g. Services"
          />
        </div>

        {/* === WhatsApp with country code dropdown (only addition) === */}
        <div>
          <label className="mb-1 block text-sm">WhatsApp number (E.164)</label>
          <div className="flex gap-2">
            <select
              value={dial}
              onChange={(e) => setDial(e.target.value)}
              className="rounded border bg-black px-3 py-2"
            >
              {COUNTRY_CODES.map((c, idx) => (
                <option key={`${c.dial}-${idx}`} value={c.dial}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              value={localNumber}
              onChange={(e) => setLocalNumber(e.target.value)}
              className="w-full rounded border bg-transparent px-3 py-2"
              placeholder="9876543210"
              inputMode="numeric"
            />
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Will save as: <code>{combineE164(dial, localNumber) || `${dial}…`}</code>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm">Contact name</label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded border bg-transparent px-3 py-2"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded border bg-black px-3 py-2"
          >
            <option value="Asia/Calcutta">Asia/Calcutta</option>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Dubai">Asia/Dubai</option>
            <option value="Asia/Singapore">Asia/Singapore</option>
            <option value="Australia/Sydney">Australia/Sydney</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm">Working hours</label>
          <div className="grid grid-cols-1 gap-2">
            {DAY_ORDER.map((d) => (
              <div key={d} className="flex flex-wrap items-center gap-2 rounded border px-3 py-2">
                <div className="w-16 font-medium">{DAY_LABELS[d]}</div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hours[d].closed}
                    onChange={(e) =>
                      setHours((prev) => ({
                        ...prev,
                        [d]: { ...prev[d], closed: e.target.checked },
                      }))
                    }
                  />
                  Holiday
                </label>

                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-gray-400">From</span>
                  <select
                    disabled={hours[d].closed}
                    value={hours[d].from}
                    onChange={(e) =>
                      setHours((prev) => ({
                        ...prev,
                        [d]: { ...prev[d], from: e.target.value },
                      }))
                    }
                    className="rounded border bg-black px-2 py-1"
                  >
                    {timeOptions.map((t) => (
                      <option key={`from-${d}-${t}`} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <span className="text-xs text-gray-400">To</span>
                  <select
                    disabled={hours[d].closed}
                    value={hours[d].to}
                    onChange={(e) =>
                      setHours((prev) => ({
                        ...prev,
                        [d]: { ...prev[d], to: e.target.value },
                      }))
                    }
                    className="rounded border bg-black px-2 py-1"
                  >
                    {timeOptions.map((t) => (
                      <option key={`to-${d}-${t}`} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Choose hours in 12-hour format with AM/PM or mark a day as Holiday.
          </p>
        </div>

        {error && <div className="text-sm text-red-400">Error: {error}</div>}

        <div className="flex gap-2">
          <button
            disabled={saving}
            onClick={onSave}
            className="rounded bg-emerald-600 px-4 py-2 text-sm"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
          <button
            onClick={() => router.push("/businessprofile")}
            className="rounded border px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
