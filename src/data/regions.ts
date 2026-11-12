import type { Zone } from "@/lib/shipping-quote";

export type District = { id: string; name: string; postalCode: string };
export type City = { id: string; name: string; zone: Zone; districts: District[] };
export type Province = { id: string; name: string; cities: City[] };

function city(id: string, name: string, zone: Zone, districts: [string, string, string][]): City {
  return {
    id,
    name,
    zone,
    districts: districts.map(([suffix, districtName, postalCode]) => ({
      id: `${id}-${suffix}`,
      name: districtName,
      postalCode,
    })),
  };
}

export const regions: Province[] = [
  {
    id: "aceh",
    name: "Aceh",
    cities: [
      city("banda-aceh", "Kota Banda Aceh", "sumatera", [
        ["baiturrahman", "Baiturrahman", "23116"],
        ["kuta-alam", "Kuta Alam", "23126"],
        ["syiah-kuala", "Syiah Kuala", "23111"],
      ]),
    ],
  },
  {
    id: "sumut",
    name: "Sumatera Utara",
    cities: [
      city("medan", "Kota Medan", "sumatera", [
        ["petisah", "Medan Petisah", "20112"],
        ["kota", "Medan Kota", "20212"],
        ["baru", "Medan Baru", "20154"],
        ["helvetia", "Medan Helvetia", "20124"],
      ]),
    ],
  },
  {
    id: "sumbar",
    name: "Sumatera Barat",
    cities: [
      city("padang", "Kota Padang", "sumatera", [
        ["barat", "Padang Barat", "25112"],
        ["timur", "Padang Timur", "25129"],
        ["kuranji", "Kuranji", "25176"],
      ]),
    ],
  },
  {
    id: "riau",
    name: "Riau",
    cities: [
      city("pekanbaru", "Kota Pekanbaru", "sumatera", [
        ["kota", "Pekanbaru Kota", "28112"],
        ["sukajadi", "Sukajadi", "28156"],
        ["marpoyan", "Marpoyan Damai", "28289"],
      ]),
    ],
  },
  {
    id: "kepri",
    name: "Kepulauan Riau",
    cities: [
      city("batam", "Kota Batam", "sumatera", [
        ["kota", "Batam Kota", "29432"],
        ["lubuk-baja", "Lubuk Baja", "29444"],
        ["batu-ampar", "Batu Ampar", "29452"],
      ]),
    ],
  },
  {
    id: "jambi",
    name: "Jambi",
    cities: [
      city("jambi-kota", "Kota Jambi", "sumatera", [
        ["telanaipura", "Telanaipura", "36122"],
        ["selatan", "Jambi Selatan", "36139"],
        ["pasar", "Pasar Jambi", "36113"],
      ]),
    ],
  },
  {
    id: "sumsel",
    name: "Sumatera Selatan",
    cities: [
      city("palembang", "Kota Palembang", "sumatera", [
        ["ilir-timur", "Ilir Timur I", "30121"],
        ["ilir-barat", "Ilir Barat I", "30137"],
        ["sukarami", "Sukarami", "30151"],
      ]),
    ],
  },
  {
    id: "babel",
    name: "Kepulauan Bangka Belitung",
    cities: [
      city("pangkalpinang", "Kota Pangkalpinang", "sumatera", [
        ["rangkui", "Rangkui", "33131"],
        ["taman-sari", "Taman Sari", "33132"],
        ["gerunggang", "Gerunggang", "33123"],
      ]),
    ],
  },
  {
    id: "bengkulu",
    name: "Bengkulu",
    cities: [
      city("bengkulu-kota", "Kota Bengkulu", "sumatera", [
        ["teluk-segara", "Teluk Segara", "38114"],
        ["muara-bangka", "Muara Bangka Hulu", "38119"],
        ["gading", "Gading Cempaka", "38221"],
      ]),
    ],
  },
  {
    id: "lampung",
    name: "Lampung",
    cities: [
      city("bandar-lampung", "Kota Bandar Lampung", "sumatera", [
        ["tanjung-karang", "Tanjung Karang Pusat", "35119"],
        ["kemiling", "Kemiling", "35153"],
        ["rajabasa", "Rajabasa", "35144"],
      ]),
    ],
  },
  {
    id: "jkt",
    name: "DKI Jakarta",
    cities: [
      city("jaksel", "Jakarta Selatan", "jabodetabek", [
        ["kebayoran-baru", "Kebayoran Baru", "12110"],
        ["kebayoran-lama", "Kebayoran Lama", "12240"],
        ["cilandak", "Cilandak", "12430"],
        ["pasar-minggu", "Pasar Minggu", "12520"],
        ["jagakarsa", "Jagakarsa", "12620"],
        ["pancoran", "Pancoran", "12780"],
        ["tebet", "Tebet", "12820"],
        ["setiabudi", "Setiabudi", "12920"],
        ["mampang", "Mampang Prapatan", "12710"],
      ]),
      city("jakpus", "Jakarta Pusat", "jabodetabek", [
        ["gambir", "Gambir", "10110"],
        ["tanah-abang", "Tanah Abang", "10230"],
        ["menteng", "Menteng", "10310"],
        ["senen", "Senen", "10410"],
        ["cempaka-putih", "Cempaka Putih", "10510"],
        ["kemayoran", "Kemayoran", "10610"],
      ]),
      city("jakbar", "Jakarta Barat", "jabodetabek", [
        ["cengkareng", "Cengkareng", "11730"],
        ["grogol", "Grogol Petamburan", "11450"],
        ["taman-sari", "Taman Sari", "11150"],
        ["kebon-jeruk", "Kebon Jeruk", "11530"],
        ["kalideres", "Kalideres", "11840"],
        ["palmerah", "Palmerah", "11480"],
        ["kembangan", "Kembangan", "11610"],
      ]),
      city("jaktim", "Jakarta Timur", "jabodetabek", [
        ["matraman", "Matraman", "13130"],
        ["pulogadung", "Pulo Gadung", "13210"],
        ["jatinegara", "Jatinegara", "13310"],
        ["duren-sawit", "Duren Sawit", "13440"],
        ["cakung", "Cakung", "13910"],
        ["kramat-jati", "Kramat Jati", "13510"],
        ["ciracas", "Ciracas", "13740"],
      ]),
      city("jakut", "Jakarta Utara", "jabodetabek", [
        ["penjaringan", "Penjaringan", "14440"],
        ["tanjung-priok", "Tanjung Priok", "14310"],
        ["koja", "Koja", "14210"],
        ["kelapa-gading", "Kelapa Gading", "14240"],
        ["cilincing", "Cilincing", "14120"],
        ["pademangan", "Pademangan", "14410"],
      ]),
    ],
  },
  {
    id: "banten",
    name: "Banten",
    cities: [
      city("tangerang", "Kota Tangerang", "jabodetabek", [
        ["batuceper", "Batuceper", "15122"],
        ["benda", "Benda", "15125"],
        ["karawaci", "Karawaci", "15113"],
        ["cibodas", "Cibodas", "15138"],
        ["cipondoh", "Cipondoh", "15148"],
      ]),
      city("tangsel", "Kota Tangerang Selatan", "jabodetabek", [
        ["serpong", "Serpong", "15310"],
        ["serpong-utara", "Serpong Utara", "15324"],
        ["pamulang", "Pamulang", "15417"],
        ["ciputat", "Ciputat", "15411"],
        ["pondok-aren", "Pondok Aren", "15224"],
      ]),
      city("serang", "Kota Serang", "jawa", [
        ["serang", "Serang", "42111"],
        ["cipocok", "Cipocok Jaya", "42123"],
        ["walantaka", "Walantaka", "42183"],
      ]),
    ],
  },
  {
    id: "jabar",
    name: "Jawa Barat",
    cities: [
      city("bandung", "Kota Bandung", "jawa", [
        ["wetan", "Bandung Wetan", "40114"],
        ["coblong", "Coblong", "40132"],
        ["sumur", "Sumur Bandung", "40111"],
        ["cicendo", "Cicendo", "40172"],
        ["buahbatu", "Buahbatu", "40286"],
        ["antapani", "Antapani", "40291"],
        ["sukajadi", "Sukajadi", "40162"],
      ]),
      city("cimahi", "Kota Cimahi", "jawa", [
        ["utara", "Cimahi Utara", "40511"],
        ["tengah", "Cimahi Tengah", "40521"],
        ["selatan", "Cimahi Selatan", "40531"],
      ]),
      city("bekasi", "Kota Bekasi", "jabodetabek", [
        ["timur", "Bekasi Timur", "17111"],
        ["barat", "Bekasi Barat", "17134"],
        ["selatan", "Bekasi Selatan", "17141"],
        ["utara", "Bekasi Utara", "17121"],
        ["medan-satria", "Medan Satria", "17132"],
      ]),
      city("depok", "Kota Depok", "jabodetabek", [
        ["pancoran-mas", "Pancoran Mas", "16431"],
        ["beji", "Beji", "16421"],
        ["sukmajaya", "Sukmajaya", "16412"],
        ["cimanggis", "Cimanggis", "16451"],
        ["sawangan", "Sawangan", "16511"],
      ]),
      city("bogor", "Kota Bogor", "jabodetabek", [
        ["tengah", "Bogor Tengah", "16124"],
        ["utara", "Bogor Utara", "16151"],
        ["timur", "Bogor Timur", "16143"],
        ["tanah-sareal", "Tanah Sareal", "16161"],
      ]),
    ],
  },
  {
    id: "jateng",
    name: "Jawa Tengah",
    cities: [
      city("semarang", "Kota Semarang", "jawa", [
        ["tengah", "Semarang Tengah", "50138"],
        ["selatan", "Semarang Selatan", "50241"],
        ["tembalang", "Tembalang", "50275"],
        ["banyumanik", "Banyumanik", "50263"],
        ["candisari", "Candisari", "50256"],
      ]),
      city("surakarta", "Kota Surakarta", "jawa", [
        ["banjarsari", "Banjarsari", "57131"],
        ["laweyan", "Laweyan", "57141"],
        ["jebres", "Jebres", "57126"],
      ]),
      city("banyumas", "Kabupaten Banyumas", "jawa", [
        ["purwokerto-timur", "Purwokerto Timur", "53113"],
        ["purwokerto-selatan", "Purwokerto Selatan", "53141"],
        ["purwokerto-barat", "Purwokerto Barat", "53133"],
      ]),
    ],
  },
  {
    id: "yogya",
    name: "DI Yogyakarta",
    cities: [
      city("yogyakarta", "Kota Yogyakarta", "jawa", [
        ["gondokusuman", "Gondokusuman", "55223"],
        ["mergangsan", "Mergangsan", "55151"],
        ["umbulharjo", "Umbulharjo", "55161"],
      ]),
      city("sleman", "Kabupaten Sleman", "jawa", [
        ["depok", "Depok", "55281"],
        ["mlati", "Mlati", "55284"],
        ["ngaglik", "Ngaglik", "55581"],
      ]),
    ],
  },
  {
    id: "jatim",
    name: "Jawa Timur",
    cities: [
      city("surabaya", "Kota Surabaya", "jawa", [
        ["genteng", "Genteng", "60275"],
        ["gubeng", "Gubeng", "60281"],
        ["tegalsari", "Tegalsari", "60262"],
        ["sukolilo", "Sukolilo", "60111"],
        ["rungkut", "Rungkut", "60293"],
        ["wonokromo", "Wonokromo", "60241"],
        ["tambaksari", "Tambaksari", "60136"],
      ]),
      city("malang", "Kota Malang", "jawa", [
        ["klojen", "Klojen", "65111"],
        ["lowokwaru", "Lowokwaru", "65141"],
        ["blimbing", "Blimbing", "65126"],
      ]),
      city("sidoarjo", "Kabupaten Sidoarjo", "jawa", [
        ["sidoarjo", "Sidoarjo", "61212"],
        ["waru", "Waru", "61256"],
        ["gedangan", "Gedangan", "61254"],
      ]),
    ],
  },
  {
    id: "bali",
    name: "Bali",
    cities: [
      city("denpasar", "Kota Denpasar", "bali_nusa", [
        ["selatan", "Denpasar Selatan", "80221"],
        ["barat", "Denpasar Barat", "80119"],
        ["timur", "Denpasar Timur", "80237"],
      ]),
      city("badung", "Kabupaten Badung", "bali_nusa", [
        ["kuta", "Kuta", "80361"],
        ["mengwi", "Mengwi", "80351"],
        ["kuta-utara", "Kuta Utara", "80361"],
      ]),
    ],
  },
  {
    id: "ntb",
    name: "Nusa Tenggara Barat",
    cities: [
      city("mataram", "Kota Mataram", "bali_nusa", [
        ["mataram", "Mataram", "83121"],
        ["cakranegara", "Cakranegara", "83239"],
        ["ampenan", "Ampenan", "83112"],
      ]),
    ],
  },
  {
    id: "ntt",
    name: "Nusa Tenggara Timur",
    cities: [
      city("kupang", "Kota Kupang", "bali_nusa", [
        ["kelapa-lima", "Kelapa Lima", "85228"],
        ["oebobo", "Oebobo", "85111"],
        ["maulafa", "Maulafa", "85148"],
      ]),
    ],
  },
  {
    id: "kalbar",
    name: "Kalimantan Barat",
    cities: [
      city("pontianak", "Kota Pontianak", "kalimantan", [
        ["kota", "Pontianak Kota", "78111"],
        ["selatan", "Pontianak Selatan", "78121"],
        ["utara", "Pontianak Utara", "78241"],
      ]),
    ],
  },
  {
    id: "kalteng",
    name: "Kalimantan Tengah",
    cities: [
      city("palangka-raya", "Kota Palangka Raya", "kalimantan", [
        ["pahandut", "Pahandut", "73111"],
        ["jekan-raya", "Jekan Raya", "73112"],
        ["bukit-batu", "Bukit Batu", "73221"],
      ]),
    ],
  },
  {
    id: "kalsel",
    name: "Kalimantan Selatan",
    cities: [
      city("banjarmasin", "Kota Banjarmasin", "kalimantan", [
        ["tengah", "Banjarmasin Tengah", "70111"],
        ["timur", "Banjarmasin Timur", "70236"],
        ["selatan", "Banjarmasin Selatan", "70246"],
      ]),
    ],
  },
  {
    id: "kaltim",
    name: "Kalimantan Timur",
    cities: [
      city("balikpapan", "Kota Balikpapan", "kalimantan", [
        ["selatan", "Balikpapan Selatan", "76114"],
        ["kota", "Balikpapan Kota", "76111"],
        ["utara", "Balikpapan Utara", "76136"],
      ]),
      city("samarinda", "Kota Samarinda", "kalimantan", [
        ["ulu", "Samarinda Ulu", "75124"],
        ["ilir", "Samarinda Ilir", "75115"],
        ["sungai-kunjang", "Sungai Kunjang", "75119"],
      ]),
    ],
  },
  {
    id: "kaltara",
    name: "Kalimantan Utara",
    cities: [
      city("tarakan", "Kota Tarakan", "kalimantan", [
        ["tengah", "Tarakan Tengah", "77113"],
        ["timur", "Tarakan Timur", "77115"],
        ["barat", "Tarakan Barat", "77111"],
      ]),
    ],
  },
  {
    id: "sulut",
    name: "Sulawesi Utara",
    cities: [
      city("manado", "Kota Manado", "sulawesi", [
        ["wenang", "Wenang", "95111"],
        ["malalayang", "Malalayang", "95163"],
        ["wanea", "Wanea", "95117"],
      ]),
    ],
  },
  {
    id: "gorontalo",
    name: "Gorontalo",
    cities: [
      city("gorontalo-kota", "Kota Gorontalo", "sulawesi", [
        ["tengah", "Kota Tengah", "96128"],
        ["dumbo-raya", "Dumbo Raya", "96112"],
        ["selatan", "Kota Selatan", "96115"],
      ]),
    ],
  },
  {
    id: "sulteng",
    name: "Sulawesi Tengah",
    cities: [
      city("palu", "Kota Palu", "sulawesi", [
        ["timur", "Palu Timur", "94111"],
        ["barat", "Palu Barat", "94111"],
        ["selatan", "Palu Selatan", "94231"],
      ]),
    ],
  },
  {
    id: "sulbar",
    name: "Sulawesi Barat",
    cities: [
      city("mamuju", "Kabupaten Mamuju", "sulawesi", [
        ["mamuju", "Mamuju", "91511"],
        ["simboro", "Simboro", "91512"],
        ["papalang", "Papalang", "91563"],
      ]),
    ],
  },
  {
    id: "sulsel",
    name: "Sulawesi Selatan",
    cities: [
      city("makassar", "Kota Makassar", "sulawesi", [
        ["ujung-pandang", "Ujung Pandang", "90111"],
        ["panakkukang", "Panakkukang", "90231"],
        ["rappocini", "Rappocini", "90221"],
        ["tamalate", "Tamalate", "90224"],
      ]),
    ],
  },
  {
    id: "sultra",
    name: "Sulawesi Tenggara",
    cities: [
      city("kendari", "Kota Kendari", "sulawesi", [
        ["barat", "Kendari Barat", "93121"],
        ["kadia", "Kadia", "93117"],
        ["mandonga", "Mandonga", "93111"],
      ]),
    ],
  },
  {
    id: "maluku",
    name: "Maluku",
    cities: [
      city("ambon", "Kota Ambon", "timur", [
        ["sirimau", "Sirimau", "97121"],
        ["nusaniwe", "Nusaniwe", "97114"],
        ["baguala", "Baguala", "97231"],
      ]),
    ],
  },
  {
    id: "malut",
    name: "Maluku Utara",
    cities: [
      city("ternate", "Kota Ternate", "timur", [
        ["tengah", "Ternate Tengah", "97721"],
        ["selatan", "Ternate Selatan", "97716"],
        ["utara", "Ternate Utara", "97723"],
      ]),
    ],
  },
  {
    id: "pbd",
    name: "Papua Barat Daya",
    cities: [
      city("sorong", "Kota Sorong", "timur", [
        ["sorong", "Sorong", "98412"],
        ["timur", "Sorong Timur", "98414"],
        ["manoi", "Sorong Manoi", "98415"],
      ]),
    ],
  },
  {
    id: "pabar",
    name: "Papua Barat",
    cities: [
      city("manokwari", "Kabupaten Manokwari", "timur", [
        ["barat", "Manokwari Barat", "98312"],
        ["timur", "Manokwari Timur", "98311"],
        ["selatan", "Manokwari Selatan", "98315"],
      ]),
    ],
  },
  {
    id: "pateng",
    name: "Papua Tengah",
    cities: [
      city("nabire", "Kabupaten Nabire", "timur", [
        ["nabire", "Nabire", "98811"],
        ["barat", "Nabire Barat", "98816"],
        ["uwapa", "Uwapa", "98854"],
      ]),
    ],
  },
  {
    id: "pagun",
    name: "Papua Pegunungan",
    cities: [
      city("wamena", "Kabupaten Jayawijaya", "timur", [
        ["wamena", "Wamena", "99511"],
        ["asologaima", "Asologaima", "99561"],
        ["hubikosi", "Hubikosi", "99562"],
      ]),
    ],
  },
  {
    id: "pasel",
    name: "Papua Selatan",
    cities: [
      city("merauke", "Kabupaten Merauke", "timur", [
        ["merauke", "Merauke", "99613"],
        ["semangga", "Semangga", "99631"],
        ["tanah-miring", "Tanah Miring", "99651"],
      ]),
    ],
  },
  {
    id: "papua",
    name: "Papua",
    cities: [
      city("jayapura", "Kota Jayapura", "timur", [
        ["utara", "Jayapura Utara", "99112"],
        ["selatan", "Jayapura Selatan", "99222"],
        ["abepura", "Abepura", "99351"],
      ]),
    ],
  },
];

export type ResolvedRegion = { province: Province; city: City; district: District };

export function resolveRegion(provinceId: string, cityId: string, districtId: string): ResolvedRegion | null {
  const province = regions.find((item) => item.id === provinceId);
  if (!province) return null;
  const foundCity = province.cities.find((item) => item.id === cityId);
  if (!foundCity) return null;
  const district = foundCity.districts.find((item) => item.id === districtId);
  if (!district) return null;
  return { province, city: foundCity, district };
}
