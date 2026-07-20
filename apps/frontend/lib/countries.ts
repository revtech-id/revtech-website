export const countries = [
  { code: "ID", dial_code: "+62", name: "Indonesia", emoji: "🇮🇩" },
  { code: "MY", dial_code: "+60", name: "Malaysia", emoji: "🇲🇾" },
  { code: "SG", dial_code: "+65", name: "Singapore", emoji: "🇸🇬" },
  { code: "BN", dial_code: "+673", name: "Brunei", emoji: "🇧🇳" },
  { code: "US", dial_code: "+1", name: "United States", emoji: "🇺🇸" },
  { code: "GB", dial_code: "+44", name: "United Kingdom", emoji: "🇬🇧" },
  { code: "AU", dial_code: "+61", name: "Australia", emoji: "🇦🇺" },
  { code: "JP", dial_code: "+81", name: "Japan", emoji: "🇯🇵" },
  { code: "KR", dial_code: "+82", name: "South Korea", emoji: "🇰🇷" },
  { code: "CN", dial_code: "+86", name: "China", emoji: "🇨🇳" },
  { code: "IN", dial_code: "+91", name: "India", emoji: "🇮🇳" },
  { code: "PH", dial_code: "+63", name: "Philippines", emoji: "🇵🇭" },
  { code: "TH", dial_code: "+66", name: "Thailand", emoji: "🇹🇭" },
  { code: "VN", dial_code: "+84", name: "Vietnam", emoji: "🇻🇳" },
  { code: "SA", dial_code: "+966", name: "Saudi Arabia", emoji: "🇸🇦" },
  { code: "AE", dial_code: "+971", name: "United Arab Emirates", emoji: "🇦🇪" },
  { code: "DE", dial_code: "+49", name: "Germany", emoji: "🇩🇪" },
  { code: "FR", dial_code: "+33", name: "France", emoji: "🇫🇷" },
  { code: "NL", dial_code: "+31", name: "Netherlands", emoji: "🇳🇱" },
  { code: "IT", dial_code: "+39", name: "Italy", emoji: "🇮🇹" },
  { code: "ES", dial_code: "+34", name: "Spain", emoji: "🇪🇸" },
  { code: "BR", dial_code: "+55", name: "Brazil", emoji: "🇧🇷" },
  { code: "ZA", dial_code: "+27", name: "South Africa", emoji: "🇿🇦" },
  { code: "NG", dial_code: "+234", name: "Nigeria", emoji: "🇳🇬" },
  { code: "EG", dial_code: "+20", name: "Egypt", emoji: "🇪🇬" },
  { code: "RU", dial_code: "+7", name: "Russia", emoji: "🇷🇺" },
  { code: "TR", dial_code: "+90", name: "Turkey", emoji: "🇹🇷" },
  { code: "PK", dial_code: "+92", name: "Pakistan", emoji: "🇵🇰" },
  { code: "BD", dial_code: "+880", name: "Bangladesh", emoji: "🇧🇩" },
  { code: "CA", dial_code: "+1", name: "Canada", emoji: "🇨🇦" },
  { code: "MX", dial_code: "+52", name: "Mexico", emoji: "🇲🇽" },
  { code: "AR", dial_code: "+54", name: "Argentina", emoji: "🇦🇷" }
].sort((a, b) => {
  // Selalu taruh Indonesia di paling atas, sisanya sesuai abjad
  if (a.code === 'ID') return -1;
  if (b.code === 'ID') return 1;
  return a.name.localeCompare(b.name);
});
