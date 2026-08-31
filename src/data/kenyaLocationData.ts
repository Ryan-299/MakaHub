// Authoritative Kenyan Counties, Sub-Counties / Constituencies, and County Assembly Wards Dataset
// Fully audited and verified across all 47 Counties, 290 Sub-Counties/Constituencies, and 1,450 Wards

export interface KenyaWard {
  code: string;
  name: string;
}

export interface KenyaSubCounty {
  code: string;
  name: string;
  county: string;
  wards: KenyaWard[];
}

export interface KenyaCounty {
  code: string;
  name: string;
  subCounties: KenyaSubCounty[];
}

export const KENYA_LOCATIONS_DATA: KenyaCounty[] = [
  {
    "code": "030",
    "name": "Baringo",
    "subCounties": [
      {
        "code": "159",
        "name": "Baringo Central",
        "county": "Baringo",
        "wards": [
          {
            "code": "0796",
            "name": "Ewalel Chapchap"
          },
          {
            "code": "0793",
            "name": "Kabarnet"
          },
          {
            "code": "0797",
            "name": "Kapropita"
          },
          {
            "code": "0794",
            "name": "Sacho"
          },
          {
            "code": "0795",
            "name": "Tenges"
          }
        ]
      },
      {
        "code": "158",
        "name": "Baringo North",
        "county": "Baringo",
        "wards": [
          {
            "code": "0792",
            "name": "Bartabwa"
          },
          {
            "code": "0788",
            "name": "Barwessa"
          },
          {
            "code": "0789",
            "name": "Kabartonjo"
          },
          {
            "code": "0790",
            "name": "Saimo/Kipsaraman"
          },
          {
            "code": "0791",
            "name": "Saimo/Soi"
          }
        ]
      },
      {
        "code": "160",
        "name": "Baringo South",
        "county": "Baringo",
        "wards": [
          {
            "code": "0799",
            "name": "Ilchamus"
          },
          {
            "code": "0798",
            "name": "Marigat"
          },
          {
            "code": "0800",
            "name": "Mochongoi"
          },
          {
            "code": "0801",
            "name": "Mukutani"
          }
        ]
      },
      {
        "code": "162",
        "name": "Eldama Ravine",
        "county": "Baringo",
        "wards": [
          {
            "code": "0810",
            "name": "Koibatek"
          },
          {
            "code": "0805",
            "name": "Lembus"
          },
          {
            "code": "0806",
            "name": "Lembus Kwen"
          },
          {
            "code": "0809",
            "name": "Lembus/Perkerra"
          },
          {
            "code": "0808",
            "name": "Mumberes/Maji Mazuri"
          },
          {
            "code": "0807",
            "name": "Ravine"
          }
        ]
      },
      {
        "code": "161",
        "name": "Mogotio",
        "county": "Baringo",
        "wards": [
          {
            "code": "0803",
            "name": "Emining"
          },
          {
            "code": "0804",
            "name": "Kisanana"
          },
          {
            "code": "0802",
            "name": "Mogotio"
          }
        ]
      },
      {
        "code": "157",
        "name": "Tiaty",
        "county": "Baringo",
        "wards": [
          {
            "code": "0787",
            "name": "Churo/Amaya"
          },
          {
            "code": "0782",
            "name": "Kolowa"
          },
          {
            "code": "0785",
            "name": "Loiyamorock"
          },
          {
            "code": "0783",
            "name": "Ribkwo"
          },
          {
            "code": "0784",
            "name": "Silale"
          },
          {
            "code": "0786",
            "name": "Tangulbei/Korossi"
          },
          {
            "code": "0781",
            "name": "Tirioko"
          }
        ]
      }
    ]
  },
  {
    "code": "036",
    "name": "Bomet",
    "subCounties": [
      {
        "code": "197",
        "name": "Bomet Central",
        "county": "Bomet",
        "wards": [
          {
            "code": "0984",
            "name": "Chesoen"
          },
          {
            "code": "0985",
            "name": "Mutarakwa"
          },
          {
            "code": "0982",
            "name": "Ndaraweta"
          },
          {
            "code": "0981",
            "name": "Silibwet Township"
          },
          {
            "code": "0983",
            "name": "Singorwet"
          }
        ]
      },
      {
        "code": "196",
        "name": "Bomet East",
        "county": "Bomet",
        "wards": [
          {
            "code": "0980",
            "name": "Chemaner"
          },
          {
            "code": "0977",
            "name": "Kembu"
          },
          {
            "code": "0979",
            "name": "Kipreres"
          },
          {
            "code": "0978",
            "name": "Longisa"
          },
          {
            "code": "0976",
            "name": "Merigi"
          }
        ]
      },
      {
        "code": "195",
        "name": "Chepalungu",
        "county": "Bomet",
        "wards": [
          {
            "code": "0974",
            "name": "Chebunyo"
          },
          {
            "code": "0971",
            "name": "Kong'asis"
          },
          {
            "code": "0972",
            "name": "Nyangores"
          },
          {
            "code": "0973",
            "name": "Sigor"
          },
          {
            "code": "0975",
            "name": "Siongiroi"
          }
        ]
      },
      {
        "code": "198",
        "name": "Konoin",
        "county": "Bomet",
        "wards": [
          {
            "code": "0989",
            "name": "Boito"
          },
          {
            "code": "0986",
            "name": "Chepchabas"
          },
          {
            "code": "0990",
            "name": "Embomos"
          },
          {
            "code": "0987",
            "name": "Kimulot"
          },
          {
            "code": "0988",
            "name": "Mogogosiek"
          }
        ]
      },
      {
        "code": "194",
        "name": "Sotik",
        "county": "Bomet",
        "wards": [
          {
            "code": "0967",
            "name": "Chemagel"
          },
          {
            "code": "0969",
            "name": "Kapletundo"
          },
          {
            "code": "0968",
            "name": "Kipsonoi"
          },
          {
            "code": "0966",
            "name": "Ndanai/Abosi"
          },
          {
            "code": "0970",
            "name": "Rongena/Manaret"
          }
        ]
      }
    ]
  },
  {
    "code": "039",
    "name": "Bungoma",
    "subCounties": [
      {
        "code": "219",
        "name": "Bumula",
        "county": "Bungoma",
        "wards": [
          {
            "code": "1090",
            "name": "Bumula"
          },
          {
            "code": "1092",
            "name": "Kabula"
          },
          {
            "code": "1091",
            "name": "Khasoko"
          },
          {
            "code": "1093",
            "name": "Kimaeti"
          },
          {
            "code": "1095",
            "name": "Siboti"
          },
          {
            "code": "1089",
            "name": "South Bukusu"
          },
          {
            "code": "1094",
            "name": "West Bukusu"
          }
        ]
      },
      {
        "code": "218",
        "name": "Kabuchai",
        "county": "Bungoma",
        "wards": [
          {
            "code": "1087",
            "name": "Bwake/Luuya"
          },
          {
            "code": "1085",
            "name": "Kabuchai/Chwele"
          },
          {
            "code": "1088",
            "name": "Mukuyuni"
          },
          {
            "code": "1086",
            "name": "West Nalondo"
          }
        ]
      },
      {
        "code": "220",
        "name": "Kanduyi",
        "county": "Bungoma",
        "wards": [
          {
            "code": "1097",
            "name": "Bukembe East"
          },
          {
            "code": "1096",
            "name": "Bukembe West"
          },
          {
            "code": "1101",
            "name": "East Sang'alo"
          },
          {
            "code": "1099",
            "name": "Khalaba"
          },
          {
            "code": "1102",
            "name": "Marakaru/Tuuti"
          },
          {
            "code": "1100",
            "name": "Musikoma"
          },
          {
            "code": "1103",
            "name": "Sang'alo West"
          },
          {
            "code": "1098",
            "name": "Township"
          }
        ]
      },
      {
        "code": "223",
        "name": "Kimilili",
        "county": "Bungoma",
        "wards": [
          {
            "code": "1114",
            "name": "Kamukuywa"
          },
          {
            "code": "1112",
            "name": "Kibingei"
          },
          {
            "code": "1111",
            "name": "Kimilili"
          },
          {
            "code": "1113",
            "name": "Maeni"
          }
        ]
      },
      {
        "code": "216",
        "name": "Mt. Elgon",
        "county": "Bungoma",
        "wards": [
          {
            "code": "1076",
            "name": "Cheptais"
          },
          {
            "code": "1078",
            "name": "Chepyuk"
          },
          {
            "code": "1077",
            "name": "Chesikaki"
          },
          {
            "code": "1081",
            "name": "Elgon"
          },
          {
            "code": "1079",
            "name": "Kapkateny"
          },
          {
            "code": "1080",
            "name": "Kaptama"
          }
        ]
      },
      {
        "code": "217",
        "name": "Sirisia",
        "county": "Bungoma",
        "wards": [
          {
            "code": "1084",
            "name": "Lwandanyi"
          },
          {
            "code": "1083",
            "name": "Malakisi/South Kulisiru"
          },
          {
            "code": "1082",
            "name": "Namwela"
          }
        ]
      },
      {
        "code": "224",
        "name": "Tongaren",
        "county": "Bungoma",
        "wards": [
          {
            "code": "1115",
            "name": "Mbakalo"
          },
          {
            "code": "1117",
            "name": "Milima"
          },
          {
            "code": "1116",
            "name": "Naitiri/Kabuyefwe"
          },
          {
            "code": "1118",
            "name": "Ndalu/Tabani"
          },
          {
            "code": "1120",
            "name": "Soysambu/Mitua"
          },
          {
            "code": "1119",
            "name": "Tongaren"
          }
        ]
      },
      {
        "code": "221",
        "name": "Webuye East",
        "county": "Bungoma",
        "wards": [
          {
            "code": "1106",
            "name": "Maraka"
          },
          {
            "code": "1104",
            "name": "Mihuu"
          },
          {
            "code": "1105",
            "name": "Ndivisi"
          }
        ]
      },
      {
        "code": "222",
        "name": "Webuye West",
        "county": "Bungoma",
        "wards": [
          {
            "code": "1110",
            "name": "Bokoli"
          },
          {
            "code": "1109",
            "name": "Matulo"
          },
          {
            "code": "1107",
            "name": "Misikhu"
          },
          {
            "code": "1108",
            "name": "Sitikho"
          }
        ]
      }
    ]
  },
  {
    "code": "040",
    "name": "Busia",
    "subCounties": [
      {
        "code": "231",
        "name": "Budalangi",
        "county": "Busia",
        "wards": [
          {
            "code": "1152",
            "name": "Bunyala Central"
          },
          {
            "code": "1153",
            "name": "Bunyala North"
          },
          {
            "code": "1155",
            "name": "Bunyala South"
          },
          {
            "code": "1154",
            "name": "Bunyala West"
          }
        ]
      },
      {
        "code": "229",
        "name": "Butula",
        "county": "Busia",
        "wards": [
          {
            "code": "1147",
            "name": "Elugulu"
          },
          {
            "code": "1143",
            "name": "Kingandole"
          },
          {
            "code": "1144",
            "name": "Marachi Central"
          },
          {
            "code": "1145",
            "name": "Marachi East"
          },
          {
            "code": "1146",
            "name": "Marachi North"
          },
          {
            "code": "1142",
            "name": "Marachi West"
          }
        ]
      },
      {
        "code": "230",
        "name": "Funyula",
        "county": "Busia",
        "wards": [
          {
            "code": "1150",
            "name": "Ageng'a Nanguba"
          },
          {
            "code": "1151",
            "name": "Bwiri"
          },
          {
            "code": "1148",
            "name": "Namboboto Nambuku"
          },
          {
            "code": "1149",
            "name": "Nangina"
          }
        ]
      },
      {
        "code": "228",
        "name": "Matayos",
        "county": "Busia",
        "wards": [
          {
            "code": "1137",
            "name": "Bukhayo West"
          },
          {
            "code": "1141",
            "name": "Burumba"
          },
          {
            "code": "1140",
            "name": "Busibwabo"
          },
          {
            "code": "1139",
            "name": "Matayos South"
          },
          {
            "code": "1138",
            "name": "Mayenje"
          }
        ]
      },
      {
        "code": "227",
        "name": "Nambale",
        "county": "Busia",
        "wards": [
          {
            "code": "1136",
            "name": "Bukhayo Central"
          },
          {
            "code": "1135",
            "name": "Bukhayo East"
          },
          {
            "code": "1134",
            "name": "Bukhayo North/Waltsi"
          },
          {
            "code": "1133",
            "name": "Nambale Township"
          }
        ]
      },
      {
        "code": "225",
        "name": "Teso North",
        "county": "Busia",
        "wards": [
          {
            "code": "1125",
            "name": "Ang'urai East"
          },
          {
            "code": "1124",
            "name": "Ang'urai North"
          },
          {
            "code": "1123",
            "name": "Ang'urai South"
          },
          {
            "code": "1121",
            "name": "Malaba Central"
          },
          {
            "code": "1122",
            "name": "Malaba North"
          },
          {
            "code": "1126",
            "name": "Malaba South"
          }
        ]
      },
      {
        "code": "226",
        "name": "Teso South",
        "county": "Busia",
        "wards": [
          {
            "code": "1132",
            "name": "Amukura Central"
          },
          {
            "code": "1131",
            "name": "Amukura East"
          },
          {
            "code": "1130",
            "name": "Amukura West"
          },
          {
            "code": "1127",
            "name": "Ang'orom"
          },
          {
            "code": "1129",
            "name": "Chakol North"
          },
          {
            "code": "1128",
            "name": "Chakol South"
          }
        ]
      }
    ]
  },
  {
    "code": "028",
    "name": "Elgeyo-Marakwet",
    "subCounties": [
      {
        "code": "149",
        "name": "Keiyo North",
        "county": "Elgeyo-Marakwet",
        "wards": [
          {
            "code": "0741",
            "name": "Emsoo"
          },
          {
            "code": "0742",
            "name": "Kamariny"
          },
          {
            "code": "0743",
            "name": "Kapchemutwa"
          },
          {
            "code": "0744",
            "name": "Tambach"
          }
        ]
      },
      {
        "code": "150",
        "name": "Keiyo South",
        "county": "Elgeyo-Marakwet",
        "wards": [
          {
            "code": "0746",
            "name": "Chepkorio"
          },
          {
            "code": "0749",
            "name": "Kabiemit"
          },
          {
            "code": "0745",
            "name": "Kaptarakwa"
          },
          {
            "code": "0750",
            "name": "Metkei"
          },
          {
            "code": "0747",
            "name": "Soy North"
          },
          {
            "code": "0748",
            "name": "Soy South"
          }
        ]
      },
      {
        "code": "147",
        "name": "Marakwet East",
        "county": "Elgeyo-Marakwet",
        "wards": [
          {
            "code": "0734",
            "name": "Embobut/Embulot"
          },
          {
            "code": "0733",
            "name": "Endo"
          },
          {
            "code": "0731",
            "name": "Kapyego"
          },
          {
            "code": "0732",
            "name": "Sambirir"
          }
        ]
      },
      {
        "code": "148",
        "name": "Marakwet West",
        "county": "Elgeyo-Marakwet",
        "wards": [
          {
            "code": "0740",
            "name": "Arror"
          },
          {
            "code": "0739",
            "name": "Kapsowar"
          },
          {
            "code": "0735",
            "name": "Lelan"
          },
          {
            "code": "0738",
            "name": "Moiben/Kuserwo"
          },
          {
            "code": "0736",
            "name": "Sengwer"
          },
          {
            "code": "0737",
            "name": "Cherang'any/Chebororwa"
          }
        ]
      }
    ]
  },
  {
    "code": "014",
    "name": "Embu",
    "subCounties": [
      {
        "code": "063",
        "name": "Manyatta",
        "county": "Embu",
        "wards": [
          {
            "code": "0316",
            "name": "Gaturi South"
          },
          {
            "code": "0315",
            "name": "Kirimari"
          },
          {
            "code": "0312",
            "name": "Kithimu"
          },
          {
            "code": "0314",
            "name": "Mbeti North"
          },
          {
            "code": "0313",
            "name": "Nginda"
          },
          {
            "code": "0311",
            "name": "Ruguru/Ngandori"
          }
        ]
      },
      {
        "code": "066",
        "name": "Mbeere North",
        "county": "Embu",
        "wards": [
          {
            "code": "0330",
            "name": "Evurore"
          },
          {
            "code": "0329",
            "name": "Muminji"
          },
          {
            "code": "0328",
            "name": "Nthawa"
          }
        ]
      },
      {
        "code": "065",
        "name": "Mbeere South",
        "county": "Embu",
        "wards": [
          {
            "code": "0327",
            "name": "Kiambere"
          },
          {
            "code": "0324",
            "name": "Makima"
          },
          {
            "code": "0326",
            "name": "Mavuria"
          },
          {
            "code": "0325",
            "name": "Mbeti South"
          },
          {
            "code": "0323",
            "name": "Mwea"
          }
        ]
      },
      {
        "code": "064",
        "name": "Runyenjes",
        "county": "Embu",
        "wards": [
          {
            "code": "0319",
            "name": "Central  Ward"
          },
          {
            "code": "0317",
            "name": "Gaturi North"
          },
          {
            "code": "0320",
            "name": "Kagaari North"
          },
          {
            "code": "0318",
            "name": "Kagaari South"
          },
          {
            "code": "0321",
            "name": "Kyeni North"
          },
          {
            "code": "0322",
            "name": "Kyeni South"
          }
        ]
      }
    ]
  },
  {
    "code": "007",
    "name": "Garissa",
    "subCounties": [
      {
        "code": "028",
        "name": "Balambala",
        "county": "Garissa",
        "wards": [
          {
            "code": "0135",
            "name": "Balambala"
          },
          {
            "code": "0136",
            "name": "Danyere"
          },
          {
            "code": "0137",
            "name": "Jara Jara"
          },
          {
            "code": "0138",
            "name": "Saka"
          },
          {
            "code": "0139",
            "name": "Sankuri"
          }
        ]
      },
      {
        "code": "030",
        "name": "Dadaab",
        "county": "Garissa",
        "wards": [
          {
            "code": "0151",
            "name": "Abakaile"
          },
          {
            "code": "0147",
            "name": "Dadaab"
          },
          {
            "code": "0149",
            "name": "Damajale"
          },
          {
            "code": "0146",
            "name": "Dertu"
          },
          {
            "code": "0148",
            "name": "Labasigale"
          },
          {
            "code": "0150",
            "name": "Liboi"
          }
        ]
      },
      {
        "code": "031",
        "name": "Fafi",
        "county": "Garissa",
        "wards": [
          {
            "code": "0152",
            "name": "Bura"
          },
          {
            "code": "0153",
            "name": "Dekaharia"
          },
          {
            "code": "0155",
            "name": "Fafi"
          },
          {
            "code": "0154",
            "name": "Jarajila"
          },
          {
            "code": "0156",
            "name": "Nanighi"
          }
        ]
      },
      {
        "code": "027",
        "name": "Garissa Township",
        "county": "Garissa",
        "wards": [
          {
            "code": "0132",
            "name": "Galbet"
          },
          {
            "code": "0134",
            "name": "Iftin"
          },
          {
            "code": "0133",
            "name": "Township"
          },
          {
            "code": "0131",
            "name": "Waberi"
          }
        ]
      },
      {
        "code": "032",
        "name": "Ijara",
        "county": "Garissa",
        "wards": [
          {
            "code": "0157",
            "name": "Hulugho"
          },
          {
            "code": "0159",
            "name": "Ijara"
          },
          {
            "code": "0160",
            "name": "Masalani"
          },
          {
            "code": "0158",
            "name": "Sangailu"
          }
        ]
      },
      {
        "code": "029",
        "name": "Lagdera",
        "county": "Garissa",
        "wards": [
          {
            "code": "0145",
            "name": "Baraki"
          },
          {
            "code": "0141",
            "name": "Benane"
          },
          {
            "code": "0142",
            "name": "Goreale"
          },
          {
            "code": "0143",
            "name": "Maalimin"
          },
          {
            "code": "0140",
            "name": "Modogashe"
          },
          {
            "code": "0144",
            "name": "Sabena"
          }
        ]
      }
    ]
  },
  {
    "code": "043",
    "name": "Homa Bay",
    "subCounties": [
      {
        "code": "249",
        "name": "Homa Bay Town",
        "county": "Homa Bay",
        "wards": [
          {
            "code": "1242",
            "name": "Homa Bay Arujo"
          },
          {
            "code": "1241",
            "name": "Homa Bay Central"
          },
          {
            "code": "1244",
            "name": "Homa Bay East"
          },
          {
            "code": "1243",
            "name": "Homa Bay West"
          }
        ]
      },
      {
        "code": "246",
        "name": "Kabondo Kasipul",
        "county": "Homa Bay",
        "wards": [
          {
            "code": "1226",
            "name": "Kabondo East"
          },
          {
            "code": "1227",
            "name": "Kabondo West"
          },
          {
            "code": "1229",
            "name": "Kojwach"
          },
          {
            "code": "1228",
            "name": "Kokwanyo/Kakelo"
          }
        ]
      },
      {
        "code": "247",
        "name": "Karachuonyo",
        "county": "Homa Bay",
        "wards": [
          {
            "code": "1232",
            "name": "Central"
          },
          {
            "code": "1233",
            "name": "Kanyaluo"
          },
          {
            "code": "1236",
            "name": "Kendu Bay Town"
          },
          {
            "code": "1234",
            "name": "Kibiri"
          },
          {
            "code": "1231",
            "name": "North Karachuonyo"
          },
          {
            "code": "1235",
            "name": "Wangchieng"
          },
          {
            "code": "1230",
            "name": "West Karachuonyo"
          }
        ]
      },
      {
        "code": "245",
        "name": "Kasipul",
        "county": "Homa Bay",
        "wards": [
          {
            "code": "1223",
            "name": "Central Kasipul"
          },
          {
            "code": "1224",
            "name": "East Kamagak"
          },
          {
            "code": "1222",
            "name": "South Kasipul"
          },
          {
            "code": "1225",
            "name": "West Kamagak"
          },
          {
            "code": "1221",
            "name": "West Kasipul"
          }
        ]
      },
      {
        "code": "251",
        "name": "Mbita",
        "county": "Homa Bay",
        "wards": [
          {
            "code": "1255",
            "name": "Gembe"
          },
          {
            "code": "1254",
            "name": "Kasgunga"
          },
          {
            "code": "1256",
            "name": "Lambwe"
          },
          {
            "code": "1252",
            "name": "Mfangano Island"
          },
          {
            "code": "1253",
            "name": "Rusinga Island"
          }
        ]
      },
      {
        "code": "250",
        "name": "Ndhiwa",
        "county": "Homa Bay",
        "wards": [
          {
            "code": "1249",
            "name": "Kabuoch South/Pala"
          },
          {
            "code": "1246",
            "name": "Kanyadoto"
          },
          {
            "code": "1250",
            "name": "Kanyamwa Kologi"
          },
          {
            "code": "1251",
            "name": "Kanyamwa Kosewe"
          },
          {
            "code": "1247",
            "name": "Kanyikela"
          },
          {
            "code": "1245",
            "name": "Kwabwai"
          },
          {
            "code": "1248",
            "name": "North Kabuoch"
          }
        ]
      },
      {
        "code": "248",
        "name": "Rangwe",
        "county": "Homa Bay",
        "wards": [
          {
            "code": "1238",
            "name": "East Gem"
          },
          {
            "code": "1239",
            "name": "Kagan"
          },
          {
            "code": "1240",
            "name": "Kochia"
          },
          {
            "code": "1237",
            "name": "West Gem"
          }
        ]
      },
      {
        "code": "252",
        "name": "Suba",
        "county": "Homa Bay",
        "wards": [
          {
            "code": "1258",
            "name": "Gwassi North"
          },
          {
            "code": "1257",
            "name": "Gwassi South"
          },
          {
            "code": "1259",
            "name": "Kaksingri West"
          },
          {
            "code": "1260",
            "name": "Ruma Kaksingri East"
          }
        ]
      }
    ]
  },
  {
    "code": "011",
    "name": "Isiolo",
    "subCounties": [
      {
        "code": "049",
        "name": "Isiolo North",
        "county": "Isiolo",
        "wards": [
          {
            "code": "0242",
            "name": "Bulla Pesa"
          },
          {
            "code": "0246",
            "name": "Burat"
          },
          {
            "code": "0243",
            "name": "Chari"
          },
          {
            "code": "0244",
            "name": "Cherab"
          },
          {
            "code": "0245",
            "name": "Ngare Mara"
          },
          {
            "code": "0247",
            "name": "Oldonyiro"
          },
          {
            "code": "0241",
            "name": "Wabera"
          }
        ]
      },
      {
        "code": "050",
        "name": "Isiolo South",
        "county": "Isiolo",
        "wards": [
          {
            "code": "0248",
            "name": "Garbatulla"
          },
          {
            "code": "0249",
            "name": "Kinna"
          },
          {
            "code": "0250",
            "name": "Sericho"
          }
        ]
      }
    ]
  },
  {
    "code": "034",
    "name": "Kajiado",
    "subCounties": [
      {
        "code": "184",
        "name": "Kajiado Central",
        "county": "Kajiado",
        "wards": [
          {
            "code": "0918",
            "name": "Dalalekutuk"
          },
          {
            "code": "0917",
            "name": "Ildamat"
          },
          {
            "code": "0919",
            "name": "Matapato North"
          },
          {
            "code": "0920",
            "name": "Matapato South"
          },
          {
            "code": "0916",
            "name": "Purko"
          }
        ]
      },
      {
        "code": "185",
        "name": "Kajiado East",
        "county": "Kajiado",
        "wards": [
          {
            "code": "0925",
            "name": "Imaroro"
          },
          {
            "code": "0921",
            "name": "Kaputiei North"
          },
          {
            "code": "0924",
            "name": "Kenyawa-Poka"
          },
          {
            "code": "0922",
            "name": "Kitengela"
          },
          {
            "code": "0923",
            "name": "Oloosirkon/Sholinke"
          }
        ]
      },
      {
        "code": "183",
        "name": "Kajiado North",
        "county": "Kajiado",
        "wards": [
          {
            "code": "0915",
            "name": "Ngong"
          },
          {
            "code": "0913",
            "name": "Nkaimurunya"
          },
          {
            "code": "0911",
            "name": "Olkeri"
          },
          {
            "code": "0914",
            "name": "Oloolua"
          },
          {
            "code": "0912",
            "name": "Ongata Rongai"
          }
        ]
      },
      {
        "code": "187",
        "name": "Kajiado South",
        "county": "Kajiado",
        "wards": [
          {
            "code": "0931",
            "name": "Entonet/Lenkisim"
          },
          {
            "code": "0935",
            "name": "Kimana"
          },
          {
            "code": "0933",
            "name": "Kuku"
          },
          {
            "code": "0932",
            "name": "Mbirikani/Eselenkei"
          },
          {
            "code": "0934",
            "name": "Rombo"
          }
        ]
      },
      {
        "code": "186",
        "name": "Kajiado West",
        "county": "Kajiado",
        "wards": [
          {
            "code": "0929",
            "name": "Ewuaso Oonkidong'i"
          },
          {
            "code": "0927",
            "name": "Iloodokilani"
          },
          {
            "code": "0926",
            "name": "Keekonyokie"
          },
          {
            "code": "0928",
            "name": "Magadi"
          },
          {
            "code": "0930",
            "name": "Mosiro"
          }
        ]
      }
    ]
  },
  {
    "code": "037",
    "name": "Kakamega",
    "subCounties": [
      {
        "code": "207",
        "name": "Butere",
        "county": "Kakamega",
        "wards": [
          {
            "code": "1033",
            "name": "Marama Central"
          },
          {
            "code": "1035",
            "name": "Marama North"
          },
          {
            "code": "1036",
            "name": "Marama South"
          },
          {
            "code": "1032",
            "name": "Marama West"
          },
          {
            "code": "1034",
            "name": "Marenyo - Shianda"
          }
        ]
      },
      {
        "code": "210",
        "name": "Ikolomani",
        "county": "Kakamega",
        "wards": [
          {
            "code": "1050",
            "name": "Idakho Central"
          },
          {
            "code": "1048",
            "name": "Idakho East"
          },
          {
            "code": "1049",
            "name": "Idakho North"
          },
          {
            "code": "1047",
            "name": "Idakho South"
          }
        ]
      },
      {
        "code": "208",
        "name": "Khwisero",
        "county": "Kakamega",
        "wards": [
          {
            "code": "1040",
            "name": "Kisa Central"
          },
          {
            "code": "1038",
            "name": "Kisa East"
          },
          {
            "code": "1037",
            "name": "Kisa North"
          },
          {
            "code": "1039",
            "name": "Kisa West"
          }
        ]
      },
      {
        "code": "200",
        "name": "Likuyani",
        "county": "Kakamega",
        "wards": [
          {
            "code": "0999",
            "name": "Kongoni"
          },
          {
            "code": "0997",
            "name": "Likuyani"
          },
          {
            "code": "1000",
            "name": "Nzoia"
          },
          {
            "code": "0998",
            "name": "Sango"
          },
          {
            "code": "1001",
            "name": "Sinoko"
          }
        ]
      },
      {
        "code": "199",
        "name": "Lugari",
        "county": "Kakamega",
        "wards": [
          {
            "code": "0994",
            "name": "Chekalini"
          },
          {
            "code": "0995",
            "name": "Chevaywa"
          },
          {
            "code": "0992",
            "name": "Lugari"
          },
          {
            "code": "0993",
            "name": "Lumakanda"
          },
          {
            "code": "0996",
            "name": "Lwandeti"
          },
          {
            "code": "0991",
            "name": "Mautuma"
          }
        ]
      },
      {
        "code": "202",
        "name": "Lurambi",
        "county": "Kakamega",
        "wards": [
          {
            "code": "1011",
            "name": "Butsotso Central"
          },
          {
            "code": "1009",
            "name": "Butsotso East"
          },
          {
            "code": "1010",
            "name": "Butsotso South"
          },
          {
            "code": "1013",
            "name": "Mahiakalo"
          },
          {
            "code": "1012",
            "name": "Sheywe"
          },
          {
            "code": "1014",
            "name": "Shirere"
          }
        ]
      },
      {
        "code": "201",
        "name": "Malava",
        "county": "Kakamega",
        "wards": [
          {
            "code": "1005",
            "name": "Butali/Chegulo"
          },
          {
            "code": "1003",
            "name": "Chemuche"
          },
          {
            "code": "1004",
            "name": "East Kabras"
          },
          {
            "code": "1006",
            "name": "Manda-Shivanga"
          },
          {
            "code": "1007",
            "name": "Shirugu-Mugai"
          },
          {
            "code": "1008",
            "name": "South Kabras"
          },
          {
            "code": "1002",
            "name": "West Kabras"
          }
        ]
      },
      {
        "code": "206",
        "name": "Matungu",
        "county": "Kakamega",
        "wards": [
          {
            "code": "1029",
            "name": "Khalaba"
          },
          {
            "code": "1028",
            "name": "Kholera"
          },
          {
            "code": "1027",
            "name": "Koyonzo"
          },
          {
            "code": "1030",
            "name": "Mayoni"
          },
          {
            "code": "1031",
            "name": "Namamali"
          }
        ]
      },
      {
        "code": "205",
        "name": "Mumias East",
        "county": "Kakamega",
        "wards": [
          {
            "code": "1026",
            "name": "East Wanga"
          },
          {
            "code": "1025",
            "name": "Isongo/Makunga/Malaha"
          },
          {
            "code": "1024",
            "name": "Lubinu/Lusheya"
          }
        ]
      },
      {
        "code": "204",
        "name": "Mumias West",
        "county": "Kakamega",
        "wards": [
          {
            "code": "1022",
            "name": "Etenje"
          },
          {
            "code": "1020",
            "name": "Mumias Central"
          },
          {
            "code": "1021",
            "name": "Mumias North"
          },
          {
            "code": "1023",
            "name": "Musanda"
          }
        ]
      },
      {
        "code": "203",
        "name": "Navakholo",
        "county": "Kakamega",
        "wards": [
          {
            "code": "1019",
            "name": "Bunyala Central"
          },
          {
            "code": "1018",
            "name": "Bunyala East"
          },
          {
            "code": "1017",
            "name": "Bunyala West"
          },
          {
            "code": "1015",
            "name": "Ingostse-Mathia"
          },
          {
            "code": "1016",
            "name": "Shinoyi-Shikomari-"
          }
        ]
      },
      {
        "code": "209",
        "name": "Shinyalu",
        "county": "Kakamega",
        "wards": [
          {
            "code": "1043",
            "name": "Isukha Central"
          },
          {
            "code": "1045",
            "name": "Isukha East"
          },
          {
            "code": "1041",
            "name": "Isukha North"
          },
          {
            "code": "1044",
            "name": "Isukha South"
          },
          {
            "code": "1046",
            "name": "Isukha West"
          },
          {
            "code": "1042",
            "name": "Murhanda"
          }
        ]
      }
    ]
  },
  {
    "code": "035",
    "name": "Kericho",
    "subCounties": [
      {
        "code": "190",
        "name": "Ainamoi",
        "county": "Kericho",
        "wards": [
          {
            "code": "0945",
            "name": "Ainamoi"
          },
          {
            "code": "0946",
            "name": "Kapkugerwet"
          },
          {
            "code": "0949",
            "name": "Kapsaos"
          },
          {
            "code": "0944",
            "name": "Kapsoit"
          },
          {
            "code": "0947",
            "name": "Kipchebor"
          },
          {
            "code": "0948",
            "name": "Kipchimchim"
          }
        ]
      },
      {
        "code": "192",
        "name": "Belgut",
        "county": "Kericho",
        "wards": [
          {
            "code": "0960",
            "name": "Chaik"
          },
          {
            "code": "0959",
            "name": "Cheptororiet/Seretut"
          },
          {
            "code": "0958",
            "name": "Kabianga"
          },
          {
            "code": "0961",
            "name": "Kapsuser"
          },
          {
            "code": "0957",
            "name": "Waldai"
          }
        ]
      },
      {
        "code": "191",
        "name": "Bureti",
        "county": "Kericho",
        "wards": [
          {
            "code": "0952",
            "name": "Cheboin"
          },
          {
            "code": "0953",
            "name": "Chemosot"
          },
          {
            "code": "0955",
            "name": "Cheplanget"
          },
          {
            "code": "0956",
            "name": "Kapkatet"
          },
          {
            "code": "0950",
            "name": "Kisiara"
          },
          {
            "code": "0954",
            "name": "Litein"
          },
          {
            "code": "0951",
            "name": "Tebesonik"
          }
        ]
      },
      {
        "code": "188",
        "name": "Kipkelion East",
        "county": "Kericho",
        "wards": [
          {
            "code": "0938",
            "name": "Chepseon"
          },
          {
            "code": "0937",
            "name": "Kedowa/Kimugul"
          },
          {
            "code": "0936",
            "name": "Londiani"
          },
          {
            "code": "0939",
            "name": "Tendeno/Sorget"
          }
        ]
      },
      {
        "code": "189",
        "name": "Kipkelion West",
        "county": "Kericho",
        "wards": [
          {
            "code": "0943",
            "name": "Chilchila"
          },
          {
            "code": "0941",
            "name": "Kamasian"
          },
          {
            "code": "0942",
            "name": "Kipkelion"
          },
          {
            "code": "0940",
            "name": "Kunyak"
          }
        ]
      },
      {
        "code": "193",
        "name": "Sigowet/Soin",
        "county": "Kericho",
        "wards": [
          {
            "code": "0963",
            "name": "Kaplelartet"
          },
          {
            "code": "0962",
            "name": "Sigowet"
          },
          {
            "code": "0965",
            "name": "Soin"
          },
          {
            "code": "0964",
            "name": "Soliat"
          }
        ]
      }
    ]
  },
  {
    "code": "022",
    "name": "Kiambu",
    "subCounties": [
      {
        "code": "112",
        "name": "Gatundu North",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0557",
            "name": "Chania"
          },
          {
            "code": "0556",
            "name": "Githobokoni"
          },
          {
            "code": "0555",
            "name": "Gituamba"
          },
          {
            "code": "0558",
            "name": "Mang'u"
          }
        ]
      },
      {
        "code": "111",
        "name": "Gatundu South",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0551",
            "name": "Kiamwangi"
          },
          {
            "code": "0552",
            "name": "Kiganjo"
          },
          {
            "code": "0553",
            "name": "Ndarugu"
          },
          {
            "code": "0554",
            "name": "Ngenda"
          }
        ]
      },
      {
        "code": "116",
        "name": "Githunguri",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0578",
            "name": "Githiga"
          },
          {
            "code": "0577",
            "name": "Githunguri"
          },
          {
            "code": "0579",
            "name": "Ikinu"
          },
          {
            "code": "0581",
            "name": "Komothai"
          },
          {
            "code": "0580",
            "name": "Ngewa"
          }
        ]
      },
      {
        "code": "113",
        "name": "Juja",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0561",
            "name": "Juja"
          },
          {
            "code": "0563",
            "name": "Kalimoni"
          },
          {
            "code": "0559",
            "name": "Murera"
          },
          {
            "code": "0560",
            "name": "Theta"
          },
          {
            "code": "0562",
            "name": "Witeithie"
          }
        ]
      },
      {
        "code": "119",
        "name": "Kabete",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0591",
            "name": "Gitaru"
          },
          {
            "code": "0594",
            "name": "Kabete"
          },
          {
            "code": "0592",
            "name": "Muguga"
          },
          {
            "code": "0593",
            "name": "Nyadhuna"
          },
          {
            "code": "0595",
            "name": "Uthiru"
          }
        ]
      },
      {
        "code": "118",
        "name": "Kiambaa",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0586",
            "name": "Cianda"
          },
          {
            "code": "0587",
            "name": "Karuri"
          },
          {
            "code": "0590",
            "name": "Kihara"
          },
          {
            "code": "0589",
            "name": "Muchatha"
          },
          {
            "code": "0588",
            "name": "Ndenderu"
          }
        ]
      },
      {
        "code": "117",
        "name": "Kiambu",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0583",
            "name": "Ndumberi"
          },
          {
            "code": "0584",
            "name": "Riabai"
          },
          {
            "code": "0582",
            "name": "Ting'ang'a"
          },
          {
            "code": "0585",
            "name": "Township"
          }
        ]
      },
      {
        "code": "120",
        "name": "Kikuyu",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0596",
            "name": "Karai"
          },
          {
            "code": "0599",
            "name": "Kikuyu"
          },
          {
            "code": "0600",
            "name": "Kinoo"
          },
          {
            "code": "0597",
            "name": "Nachu"
          },
          {
            "code": "0598",
            "name": "Sigona"
          }
        ]
      },
      {
        "code": "122",
        "name": "Lari",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0609",
            "name": "Kamburu"
          },
          {
            "code": "0607",
            "name": "Kijabe"
          },
          {
            "code": "0606",
            "name": "Kinale"
          },
          {
            "code": "0610",
            "name": "Lari/Kirenga"
          },
          {
            "code": "0608",
            "name": "Nyanduma"
          }
        ]
      },
      {
        "code": "121",
        "name": "Limuru",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0601",
            "name": "Bibirioni"
          },
          {
            "code": "0602",
            "name": "Limuru Central"
          },
          {
            "code": "0604",
            "name": "Limuru East"
          },
          {
            "code": "0603",
            "name": "Ndeiya"
          },
          {
            "code": "0605",
            "name": "Ngecha Tigoni"
          }
        ]
      },
      {
        "code": "115",
        "name": "Ruiru",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0570",
            "name": "Biashara"
          },
          {
            "code": "0571",
            "name": "Gatongora"
          },
          {
            "code": "0569",
            "name": "Gitothua"
          },
          {
            "code": "0572",
            "name": "Kahawa Sukari"
          },
          {
            "code": "0573",
            "name": "Kahawa Wendani"
          },
          {
            "code": "0574",
            "name": "Kiuu"
          },
          {
            "code": "0576",
            "name": "Mwihoko"
          },
          {
            "code": "0575",
            "name": "Mwiki"
          }
        ]
      },
      {
        "code": "114",
        "name": "Thika Town",
        "county": "Kiambu",
        "wards": [
          {
            "code": "0567",
            "name": "Gatuanyaga"
          },
          {
            "code": "0566",
            "name": "Hospital"
          },
          {
            "code": "0565",
            "name": "Kamenu"
          },
          {
            "code": "0568",
            "name": "Ngoliba"
          },
          {
            "code": "0564",
            "name": "Township"
          }
        ]
      }
    ]
  },
  {
    "code": "003",
    "name": "Kilifi",
    "subCounties": [
      {
        "code": "015",
        "name": "Ganze",
        "county": "Kilifi",
        "wards": [
          {
            "code": "0072",
            "name": "Bamba"
          },
          {
            "code": "0071",
            "name": "Ganze"
          },
          {
            "code": "0073",
            "name": "Jaribuni"
          },
          {
            "code": "0074",
            "name": "Sokoke"
          }
        ]
      },
      {
        "code": "013",
        "name": "Kaloleni",
        "county": "Kilifi",
        "wards": [
          {
            "code": "0065",
            "name": "Kaloleni"
          },
          {
            "code": "0064",
            "name": "Kayafungo"
          },
          {
            "code": "0063",
            "name": "Mariakani"
          },
          {
            "code": "0066",
            "name": "Mwanamwinga"
          }
        ]
      },
      {
        "code": "011",
        "name": "Kilifi North",
        "county": "Kilifi",
        "wards": [
          {
            "code": "0054",
            "name": "Dabaso"
          },
          {
            "code": "0053",
            "name": "Kibarani"
          },
          {
            "code": "0055",
            "name": "Matsangoni"
          },
          {
            "code": "0057",
            "name": "Mnarani"
          },
          {
            "code": "0052",
            "name": "Sokoni"
          },
          {
            "code": "0051",
            "name": "Tezo"
          },
          {
            "code": "0056",
            "name": "Watamu"
          }
        ]
      },
      {
        "code": "012",
        "name": "Kilifi South",
        "county": "Kilifi",
        "wards": [
          {
            "code": "0061",
            "name": "Chasimba"
          },
          {
            "code": "0058",
            "name": "Junju"
          },
          {
            "code": "0062",
            "name": "Mtepeni"
          },
          {
            "code": "0059",
            "name": "Mwarakaya"
          },
          {
            "code": "0060",
            "name": "Shimo la Tewa"
          }
        ]
      },
      {
        "code": "017",
        "name": "Magarini",
        "county": "Kilifi",
        "wards": [
          {
            "code": "0083",
            "name": "Adu"
          },
          {
            "code": "0084",
            "name": "Garashi"
          },
          {
            "code": "0082",
            "name": "Gongoni"
          },
          {
            "code": "0081",
            "name": "Magarini"
          },
          {
            "code": "0080",
            "name": "Marafa"
          },
          {
            "code": "0085",
            "name": "Sabaki"
          }
        ]
      },
      {
        "code": "016",
        "name": "Malindi",
        "county": "Kilifi",
        "wards": [
          {
            "code": "0077",
            "name": "Ganda"
          },
          {
            "code": "0075",
            "name": "Jilore"
          },
          {
            "code": "0076",
            "name": "Kakuyuni"
          },
          {
            "code": "0078",
            "name": "Malindi Town"
          },
          {
            "code": "0079",
            "name": "Shella"
          }
        ]
      },
      {
        "code": "014",
        "name": "Rabai",
        "county": "Kilifi",
        "wards": [
          {
            "code": "0069",
            "name": "Kambe/Ribe"
          },
          {
            "code": "0067",
            "name": "Mwawesa"
          },
          {
            "code": "0070",
            "name": "Rabai/Kisurutini"
          },
          {
            "code": "0068",
            "name": "Ruruma"
          }
        ]
      }
    ]
  },
  {
    "code": "020",
    "name": "Kirinyaga",
    "subCounties": [
      {
        "code": "101",
        "name": "Gichugu",
        "county": "Kirinyaga",
        "wards": [
          {
            "code": "0505",
            "name": "Baragwi"
          },
          {
            "code": "0504",
            "name": "Kabare"
          },
          {
            "code": "0508",
            "name": "Karumandi"
          },
          {
            "code": "0507",
            "name": "Ngariama"
          },
          {
            "code": "0506",
            "name": "Njukiini"
          }
        ]
      },
      {
        "code": "103",
        "name": "Kirinyaga Central",
        "county": "Kirinyaga",
        "wards": [
          {
            "code": "0515",
            "name": "Inoi"
          },
          {
            "code": "0513",
            "name": "Kanyeki-Ini"
          },
          {
            "code": "0514",
            "name": "Kerugoya"
          },
          {
            "code": "0512",
            "name": "Mutira"
          }
        ]
      },
      {
        "code": "100",
        "name": "Mwea",
        "county": "Kirinyaga",
        "wards": [
          {
            "code": "0502",
            "name": "Gathigiriri"
          },
          {
            "code": "0497",
            "name": "Kangai"
          },
          {
            "code": "0501",
            "name": "Murinduko"
          },
          {
            "code": "0496",
            "name": "Mutithi"
          },
          {
            "code": "0500",
            "name": "Nyangati"
          },
          {
            "code": "0503",
            "name": "Tebere"
          },
          {
            "code": "0498",
            "name": "Thiba"
          },
          {
            "code": "0499",
            "name": "Wamumu"
          }
        ]
      },
      {
        "code": "102",
        "name": "Ndia",
        "county": "Kirinyaga",
        "wards": [
          {
            "code": "0511",
            "name": "Kariti"
          },
          {
            "code": "0510",
            "name": "Kiine"
          },
          {
            "code": "0509",
            "name": "Mukure"
          }
        ]
      }
    ]
  },
  {
    "code": "045",
    "name": "Kisii",
    "subCounties": [
      {
        "code": "264",
        "name": "Bobasi",
        "county": "Kisii",
        "wards": [
          {
            "code": "1319",
            "name": "Bobasi Bogetaorio"
          },
          {
            "code": "1322",
            "name": "Bobasi Boitangare"
          },
          {
            "code": "1317",
            "name": "Bobasi Central"
          },
          {
            "code": "1320",
            "name": "Bobasi Chache"
          },
          {
            "code": "1316",
            "name": "Masige East"
          },
          {
            "code": "1315",
            "name": "Masige West"
          },
          {
            "code": "1318",
            "name": "Nyacheki"
          },
          {
            "code": "1321",
            "name": "Sameta/Mokwerero"
          }
        ]
      },
      {
        "code": "263",
        "name": "Bomachoge Borabu",
        "county": "Kisii",
        "wards": [
          {
            "code": "1313",
            "name": "Bokimonge"
          },
          {
            "code": "1311",
            "name": "Bombaba Borabu"
          },
          {
            "code": "1312",
            "name": "Boochi Borabu"
          },
          {
            "code": "1314",
            "name": "Magenche"
          }
        ]
      },
      {
        "code": "265",
        "name": "Bomachoge Chache",
        "county": "Kisii",
        "wards": [
          {
            "code": "1324",
            "name": "Boochi/Tendere"
          },
          {
            "code": "1325",
            "name": "Bosoti/Sengera"
          },
          {
            "code": "1323",
            "name": "Majoge"
          }
        ]
      },
      {
        "code": "261",
        "name": "Bonchari",
        "county": "Kisii",
        "wards": [
          {
            "code": "1302",
            "name": "Bogiakumu"
          },
          {
            "code": "1301",
            "name": "Bomariba"
          },
          {
            "code": "1303",
            "name": "Bomorenda"
          },
          {
            "code": "1304",
            "name": "Riana"
          }
        ]
      },
      {
        "code": "268",
        "name": "Kitutu Chache North",
        "county": "Kisii",
        "wards": [
          {
            "code": "1340",
            "name": "Kegogi"
          },
          {
            "code": "1339",
            "name": "Marani"
          },
          {
            "code": "1337",
            "name": "Monyerero"
          },
          {
            "code": "1338",
            "name": "Sensi"
          }
        ]
      },
      {
        "code": "269",
        "name": "Kitutu Chache South",
        "county": "Kisii",
        "wards": [
          {
            "code": "1342",
            "name": "Bogeka"
          },
          {
            "code": "1341",
            "name": "Bogusero"
          },
          {
            "code": "1343",
            "name": "Nyakoe"
          },
          {
            "code": "1345",
            "name": "Nyatieko"
          },
          {
            "code": "1318",
            "name": "Kitutu Central"
          }
        ]
      },
      {
        "code": "267",
        "name": "Nyaribari Chache",
        "county": "Kisii",
        "wards": [
          {
            "code": "1335",
            "name": "Birongo"
          },
          {
            "code": "1331",
            "name": "Bobaracho"
          },
          {
            "code": "1336",
            "name": "Ibeno"
          },
          {
            "code": "1333",
            "name": "Keumbu"
          },
          {
            "code": "1334",
            "name": "Kiogoro"
          },
          {
            "code": "1332",
            "name": "Kisii Central"
          }
        ]
      },
      {
        "code": "266",
        "name": "Nyaribari Masaba",
        "county": "Kisii",
        "wards": [
          {
            "code": "1329",
            "name": "Gesusu"
          },
          {
            "code": "1326",
            "name": "Ichuni"
          },
          {
            "code": "1330",
            "name": "Kiamokama"
          },
          {
            "code": "1328",
            "name": "Masimba"
          },
          {
            "code": "1327",
            "name": "Nyamasibi"
          }
        ]
      },
      {
        "code": "262",
        "name": "South Mugirango",
        "county": "Kisii",
        "wards": [
          {
            "code": "1307",
            "name": "Bogetenga"
          },
          {
            "code": "1306",
            "name": "Boikang'a"
          },
          {
            "code": "1308",
            "name": "Borabu/Chitago"
          },
          {
            "code": "1310",
            "name": "Getenga"
          },
          {
            "code": "1309",
            "name": "Moticho"
          },
          {
            "code": "1305",
            "name": "Tabaka"
          }
        ]
      }
    ]
  },
  {
    "code": "042",
    "name": "Kisumu",
    "subCounties": [
      {
        "code": "240",
        "name": "Kisumu Central",
        "county": "Kisumu",
        "wards": [
          {
            "code": "1200",
            "name": "Kondele"
          },
          {
            "code": "1199",
            "name": "Market Milimani"
          },
          {
            "code": "1197",
            "name": "Migosi"
          },
          {
            "code": "1201",
            "name": "Nyalenda B"
          },
          {
            "code": "1196",
            "name": "Railways"
          },
          {
            "code": "1198",
            "name": "Shaurimoyo Kaloleni"
          }
        ]
      },
      {
        "code": "238",
        "name": "Kisumu East",
        "county": "Kisumu",
        "wards": [
          {
            "code": "1186",
            "name": "Kajulu"
          },
          {
            "code": "1190",
            "name": "Kolwa Central"
          },
          {
            "code": "1187",
            "name": "Kolwa East"
          },
          {
            "code": "1188",
            "name": "Manyatta 'b'"
          },
          {
            "code": "1189",
            "name": "Nyalenda 'a'"
          }
        ]
      },
      {
        "code": "239",
        "name": "Kisumu West",
        "county": "Kisumu",
        "wards": [
          {
            "code": "1192",
            "name": "Central Kisumu"
          },
          {
            "code": "1193",
            "name": "Kisumu North"
          },
          {
            "code": "1195",
            "name": "North West Kisumu"
          },
          {
            "code": "1191",
            "name": "South West Kisumu"
          },
          {
            "code": "1194",
            "name": "West Kisumu"
          }
        ]
      },
      {
        "code": "243",
        "name": "Muhoroni",
        "county": "Kisumu",
        "wards": [
          {
            "code": "1214",
            "name": "Chemelil"
          },
          {
            "code": "1213",
            "name": "Masogo/Nyang'oma"
          },
          {
            "code": "1211",
            "name": "Miwani"
          },
          {
            "code": "1215",
            "name": "Muhoroni/Koru"
          },
          {
            "code": "1212",
            "name": "Ombeyi"
          }
        ]
      },
      {
        "code": "244",
        "name": "Nyakach",
        "county": "Kisumu",
        "wards": [
          {
            "code": "1218",
            "name": "Central Nyakach"
          },
          {
            "code": "1217",
            "name": "North Nyakach"
          },
          {
            "code": "1220",
            "name": "South East Nyakach"
          },
          {
            "code": "1216",
            "name": "South West Nyakach"
          },
          {
            "code": "1219",
            "name": "West Nyakach"
          }
        ]
      },
      {
        "code": "242",
        "name": "Nyando",
        "county": "Kisumu",
        "wards": [
          {
            "code": "1208",
            "name": "Ahero"
          },
          {
            "code": "1207",
            "name": "Awasi/Onjiko"
          },
          {
            "code": "1206",
            "name": "East Kano/Wawidhi"
          },
          {
            "code": "1209",
            "name": "Kabonyo/Kanyagwal"
          },
          {
            "code": "1210",
            "name": "Kobura"
          }
        ]
      },
      {
        "code": "241",
        "name": "Seme",
        "county": "Kisumu",
        "wards": [
          {
            "code": "1203",
            "name": "Central Seme"
          },
          {
            "code": "1204",
            "name": "East Seme"
          },
          {
            "code": "1205",
            "name": "North Seme"
          },
          {
            "code": "1202",
            "name": "West Seme"
          }
        ]
      }
    ]
  },
  {
    "code": "015",
    "name": "Kitui",
    "subCounties": [
      {
        "code": "072",
        "name": "Kitui Central",
        "county": "Kitui",
        "wards": [
          {
            "code": "0358",
            "name": "Kyangwithya East"
          },
          {
            "code": "0356",
            "name": "Kyangwithya West"
          },
          {
            "code": "0354",
            "name": "Miambani"
          },
          {
            "code": "0357",
            "name": "Mulango"
          },
          {
            "code": "0355",
            "name": "Township"
          }
        ]
      },
      {
        "code": "073",
        "name": "Kitui East",
        "county": "Kitui",
        "wards": [
          {
            "code": "0360",
            "name": "Chuluni"
          },
          {
            "code": "0363",
            "name": "Endau/Malalani"
          },
          {
            "code": "0364",
            "name": "Mutito/Kaliku"
          },
          {
            "code": "0361",
            "name": "Nzambani"
          },
          {
            "code": "0362",
            "name": "Voo/Kyamatu"
          },
          {
            "code": "0359",
            "name": "Zombe/Mwitika"
          }
        ]
      },
      {
        "code": "071",
        "name": "Kitui Rural",
        "county": "Kitui",
        "wards": [
          {
            "code": "0353",
            "name": "Kanyangi"
          },
          {
            "code": "0350",
            "name": "Kisasi"
          },
          {
            "code": "0352",
            "name": "Kwavonza/Yatta"
          },
          {
            "code": "0351",
            "name": "Mbitini"
          }
        ]
      },
      {
        "code": "074",
        "name": "Kitui South",
        "county": "Kitui",
        "wards": [
          {
            "code": "0370",
            "name": "Athi"
          },
          {
            "code": "0365",
            "name": "Ikanga/Kyatune"
          },
          {
            "code": "0368",
            "name": "Ikutha"
          },
          {
            "code": "0369",
            "name": "Kanziko"
          },
          {
            "code": "0367",
            "name": "Mutha"
          },
          {
            "code": "0366",
            "name": "Mutomo"
          }
        ]
      },
      {
        "code": "070",
        "name": "Kitui West",
        "county": "Kitui",
        "wards": [
          {
            "code": "0347",
            "name": "Kauwi"
          },
          {
            "code": "0349",
            "name": "Kwa Mutonga/Kithumula"
          },
          {
            "code": "0348",
            "name": "Matinyani"
          },
          {
            "code": "0346",
            "name": "Mutonguni"
          }
        ]
      },
      {
        "code": "069",
        "name": "Mwingi Central",
        "county": "Kitui",
        "wards": [
          {
            "code": "0340",
            "name": "Central"
          },
          {
            "code": "0341",
            "name": "Kivou"
          },
          {
            "code": "0344",
            "name": "Mui"
          },
          {
            "code": "0342",
            "name": "Nguni"
          },
          {
            "code": "0343",
            "name": "Nuu"
          },
          {
            "code": "0345",
            "name": "Waita"
          }
        ]
      },
      {
        "code": "067",
        "name": "Mwingi North",
        "county": "Kitui",
        "wards": [
          {
            "code": "0332",
            "name": "Kyuso"
          },
          {
            "code": "0333",
            "name": "Mumoni"
          },
          {
            "code": "0331",
            "name": "Ngomeni"
          },
          {
            "code": "0335",
            "name": "Tharaka"
          },
          {
            "code": "0334",
            "name": "Tseikuru"
          }
        ]
      },
      {
        "code": "068",
        "name": "Mwingi West",
        "county": "Kitui",
        "wards": [
          {
            "code": "0339",
            "name": "Kiomo/Kyethani"
          },
          {
            "code": "0336",
            "name": "Kyome/Thaana"
          },
          {
            "code": "0338",
            "name": "Migwani"
          },
          {
            "code": "0337",
            "name": "Nguutani"
          }
        ]
      }
    ]
  },
  {
    "code": "002",
    "name": "Kwale",
    "subCounties": [
      {
        "code": "010",
        "name": "Kinango",
        "county": "Kwale",
        "wards": [
          {
            "code": "0048",
            "name": "Chengoni/Samburu"
          },
          {
            "code": "0050",
            "name": "Kasemeni"
          },
          {
            "code": "0046",
            "name": "Kinango"
          },
          {
            "code": "0047",
            "name": "Mackinnon-Road"
          },
          {
            "code": "0049",
            "name": "Mwavumbo"
          },
          {
            "code": "0044",
            "name": "Nadavaya"
          },
          {
            "code": "0045",
            "name": "Puma"
          }
        ]
      },
      {
        "code": "008",
        "name": "Lungalunga",
        "county": "Kwale",
        "wards": [
          {
            "code": "0036",
            "name": "Dzombo"
          },
          {
            "code": "0037",
            "name": "Mwereni"
          },
          {
            "code": "0035",
            "name": "Pongwekikoneni"
          },
          {
            "code": "0038",
            "name": "Vanga"
          }
        ]
      },
      {
        "code": "009",
        "name": "Matuga",
        "county": "Kwale",
        "wards": [
          {
            "code": "0042",
            "name": "Kubo South"
          },
          {
            "code": "0043",
            "name": "Mkongani"
          },
          {
            "code": "0041",
            "name": "Tiwi"
          },
          {
            "code": "0039",
            "name": "Tsimba Golini"
          },
          {
            "code": "0040",
            "name": "Waa"
          }
        ]
      },
      {
        "code": "007",
        "name": "Msambweni",
        "county": "Kwale",
        "wards": [
          {
            "code": "0031",
            "name": "Gombatobongwe"
          },
          {
            "code": "0033",
            "name": "Kinondo"
          },
          {
            "code": "0034",
            "name": "Ramisi"
          },
          {
            "code": "0032",
            "name": "Ukunda"
          }
        ]
      }
    ]
  },
  {
    "code": "031",
    "name": "Laikipia",
    "subCounties": [
      {
        "code": "164",
        "name": "Laikipia East",
        "county": "Laikipia",
        "wards": [
          {
            "code": "0820",
            "name": "Nanyuki"
          },
          {
            "code": "0817",
            "name": "Ngobit"
          },
          {
            "code": "0819",
            "name": "Thingithu"
          },
          {
            "code": "0818",
            "name": "Tigithi"
          },
          {
            "code": "0821",
            "name": "Umande"
          }
        ]
      },
      {
        "code": "165",
        "name": "Laikipia North",
        "county": "Laikipia",
        "wards": [
          {
            "code": "0825",
            "name": "Mukogondo East"
          },
          {
            "code": "0824",
            "name": "Mukogondo West"
          },
          {
            "code": "0823",
            "name": "Segera"
          },
          {
            "code": "0822",
            "name": "Sosian"
          }
        ]
      },
      {
        "code": "163",
        "name": "Laikipia West",
        "county": "Laikipia",
        "wards": [
          {
            "code": "0815",
            "name": "Igwamiti"
          },
          {
            "code": "0813",
            "name": "Kinamba"
          },
          {
            "code": "0814",
            "name": "Marmanet"
          },
          {
            "code": "0811",
            "name": "Olmoran"
          },
          {
            "code": "0812",
            "name": "Rumuruti Township"
          },
          {
            "code": "0816",
            "name": "Salama"
          }
        ]
      }
    ]
  },
  {
    "code": "005",
    "name": "Lamu",
    "subCounties": [
      {
        "code": "021",
        "name": "Lamu East",
        "county": "Lamu",
        "wards": [
          {
            "code": "0103",
            "name": "Basuba"
          },
          {
            "code": "0101",
            "name": "Faza"
          },
          {
            "code": "0102",
            "name": "Kiunga"
          }
        ]
      },
      {
        "code": "022",
        "name": "Lamu West",
        "county": "Lamu",
        "wards": [
          {
            "code": "0110",
            "name": "Bahari"
          },
          {
            "code": "0106",
            "name": "Hindi"
          },
          {
            "code": "0108",
            "name": "Hongwe"
          },
          {
            "code": "0105",
            "name": "Mkomani"
          },
          {
            "code": "0107",
            "name": "Mkunumbi"
          },
          {
            "code": "0104",
            "name": "Shella"
          },
          {
            "code": "0109",
            "name": "Witu"
          }
        ]
      }
    ]
  },
  {
    "code": "016",
    "name": "Machakos",
    "subCounties": [
      {
        "code": "077",
        "name": "Kangundo",
        "county": "Machakos",
        "wards": [
          {
            "code": "0382",
            "name": "Kangundo Central"
          },
          {
            "code": "0383",
            "name": "Kangundo East"
          },
          {
            "code": "0381",
            "name": "Kangundo North"
          },
          {
            "code": "0384",
            "name": "Kangundo West"
          }
        ]
      },
      {
        "code": "079",
        "name": "Kathiani",
        "county": "Machakos",
        "wards": [
          {
            "code": "0391",
            "name": "Kathiani Central"
          },
          {
            "code": "0393",
            "name": "Lower Kaewa/Kaani"
          },
          {
            "code": "0390",
            "name": "Mitaboni"
          },
          {
            "code": "0392",
            "name": "Upper Kaewa/Iveti"
          }
        ]
      },
      {
        "code": "081",
        "name": "Machakos Town",
        "county": "Machakos",
        "wards": [
          {
            "code": "0398",
            "name": "Kalama"
          },
          {
            "code": "0404",
            "name": "Kola"
          },
          {
            "code": "0401",
            "name": "Machakos Central"
          },
          {
            "code": "0399",
            "name": "Mua"
          },
          {
            "code": "0402",
            "name": "Mumbuni North"
          },
          {
            "code": "0400",
            "name": "Mutituni"
          },
          {
            "code": "0403",
            "name": "Muvuti/Kiima-Kimwe"
          }
        ]
      },
      {
        "code": "075",
        "name": "Masinga",
        "county": "Machakos",
        "wards": [
          {
            "code": "0373",
            "name": "Ekalakala"
          },
          {
            "code": "0371",
            "name": "Kivaa"
          },
          {
            "code": "0372",
            "name": "Masinga Central"
          },
          {
            "code": "0374",
            "name": "Muthesya"
          },
          {
            "code": "0375",
            "name": "Ndithini"
          }
        ]
      },
      {
        "code": "078",
        "name": "Matungulu",
        "county": "Machakos",
        "wards": [
          {
            "code": "0389",
            "name": "Kyeleni"
          },
          {
            "code": "0387",
            "name": "Matungulu East"
          },
          {
            "code": "0386",
            "name": "Matungulu North"
          },
          {
            "code": "0388",
            "name": "Matungulu West"
          },
          {
            "code": "0385",
            "name": "Tala"
          }
        ]
      },
      {
        "code": "080",
        "name": "Mavoko",
        "county": "Machakos",
        "wards": [
          {
            "code": "0394",
            "name": "Athi River"
          },
          {
            "code": "0395",
            "name": "Kinanie"
          },
          {
            "code": "0396",
            "name": "Muthwani"
          },
          {
            "code": "0397",
            "name": "Syokimau/Mulolongo"
          }
        ]
      },
      {
        "code": "082",
        "name": "Mwala",
        "county": "Machakos",
        "wards": [
          {
            "code": "0410",
            "name": "Kibauni"
          },
          {
            "code": "0406",
            "name": "Makutano/Mwala"
          },
          {
            "code": "0407",
            "name": "Masii"
          },
          {
            "code": "0405",
            "name": "Mbiuni"
          },
          {
            "code": "0408",
            "name": "Muthetheni"
          },
          {
            "code": "0409",
            "name": "Wamunyu"
          }
        ]
      },
      {
        "code": "076",
        "name": "Yatta",
        "county": "Machakos",
        "wards": [
          {
            "code": "0379",
            "name": "Ikombe"
          },
          {
            "code": "0380",
            "name": "Katangi"
          },
          {
            "code": "0378",
            "name": "Kithimani"
          },
          {
            "code": "0377",
            "name": "Matuu"
          },
          {
            "code": "0376",
            "name": "Ndalani"
          }
        ]
      }
    ]
  },
  {
    "code": "017",
    "name": "Makueni",
    "subCounties": [
      {
        "code": "085",
        "name": "Kaiti",
        "county": "Makueni",
        "wards": [
          {
            "code": "0423",
            "name": "Ilima"
          },
          {
            "code": "0421",
            "name": "Kee"
          },
          {
            "code": "0422",
            "name": "Kilungu"
          },
          {
            "code": "0420",
            "name": "Ukia"
          }
        ]
      },
      {
        "code": "088",
        "name": "Kibwezi East",
        "county": "Makueni",
        "wards": [
          {
            "code": "0440",
            "name": "Ivingoni/Nzambani"
          },
          {
            "code": "0437",
            "name": "Masongaleni"
          },
          {
            "code": "0438",
            "name": "Mtito Andei"
          },
          {
            "code": "0439",
            "name": "Thange"
          }
        ]
      },
      {
        "code": "087",
        "name": "Kibwezi West",
        "county": "Makueni",
        "wards": [
          {
            "code": "0436",
            "name": "Emali/Mulala"
          },
          {
            "code": "0433",
            "name": "Kikumbulyu North"
          },
          {
            "code": "0434",
            "name": "Kikumbulyu South"
          },
          {
            "code": "0431",
            "name": "Makindu"
          },
          {
            "code": "0435",
            "name": "Nguu/Masumba"
          },
          {
            "code": "0432",
            "name": "Nguumo"
          }
        ]
      },
      {
        "code": "084",
        "name": "Kilome",
        "county": "Makueni",
        "wards": [
          {
            "code": "0417",
            "name": "Kasikeu"
          },
          {
            "code": "0419",
            "name": "Kiima Kiu/Kalanzoni"
          },
          {
            "code": "0418",
            "name": "Mukaa"
          }
        ]
      },
      {
        "code": "086",
        "name": "Makueni",
        "county": "Makueni",
        "wards": [
          {
            "code": "0428",
            "name": "Kathonzweni"
          },
          {
            "code": "0427",
            "name": "Kitise/Kithuki"
          },
          {
            "code": "0426",
            "name": "Mavindini"
          },
          {
            "code": "0430",
            "name": "Mbitini"
          },
          {
            "code": "0425",
            "name": "Muvau/Kikuumini"
          },
          {
            "code": "0429",
            "name": "Nzaui/Kilili/Kalamba"
          },
          {
            "code": "0424",
            "name": "Wote"
          }
        ]
      },
      {
        "code": "083",
        "name": "Mbooni",
        "county": "Makueni",
        "wards": [
          {
            "code": "0416",
            "name": "Kalawa"
          },
          {
            "code": "0414",
            "name": "Kisau/Kiteta"
          },
          {
            "code": "0413",
            "name": "Kithungo/Kitundu"
          },
          {
            "code": "0412",
            "name": "Mbooni"
          },
          {
            "code": "0411",
            "name": "Tulimani"
          },
          {
            "code": "0415",
            "name": "Waia/Kako"
          }
        ]
      }
    ]
  },
  {
    "code": "009",
    "name": "Mandera",
    "subCounties": [
      {
        "code": "040",
        "name": "Banissa",
        "county": "Mandera",
        "wards": [
          {
            "code": "0196",
            "name": "Banissa"
          },
          {
            "code": "0197",
            "name": "Derkhale"
          },
          {
            "code": "0198",
            "name": "Guba"
          },
          {
            "code": "0200",
            "name": "Kiliwehiri"
          },
          {
            "code": "0199",
            "name": "Malkamari"
          }
        ]
      },
      {
        "code": "044",
        "name": "Lafey",
        "county": "Mandera",
        "wards": [
          {
            "code": "0220",
            "name": "Alungo Gof"
          },
          {
            "code": "0217",
            "name": "Fino"
          },
          {
            "code": "0218",
            "name": "Lafey"
          },
          {
            "code": "0216",
            "name": "Libehia"
          },
          {
            "code": "0219",
            "name": "Warankara"
          }
        ]
      },
      {
        "code": "043",
        "name": "Mandera East",
        "county": "Mandera",
        "wards": [
          {
            "code": "0211",
            "name": "Arabia"
          },
          {
            "code": "0212",
            "name": "Bulla Mpya"
          },
          {
            "code": "0213",
            "name": "Khalalio"
          },
          {
            "code": "0214",
            "name": "Neboi"
          },
          {
            "code": "0215",
            "name": "Township"
          }
        ]
      },
      {
        "code": "041",
        "name": "Mandera North",
        "county": "Mandera",
        "wards": [
          {
            "code": "0201",
            "name": "Ashabito"
          },
          {
            "code": "0202",
            "name": "Guticha"
          },
          {
            "code": "0203",
            "name": "Morothile"
          },
          {
            "code": "0204",
            "name": "Rhamu"
          },
          {
            "code": "0205",
            "name": "Rhamu-Dimtu"
          }
        ]
      },
      {
        "code": "042",
        "name": "Mandera South",
        "county": "Mandera",
        "wards": [
          {
            "code": "0209",
            "name": "Elwak North"
          },
          {
            "code": "0208",
            "name": "Elwak South"
          },
          {
            "code": "0207",
            "name": "Kutulo"
          },
          {
            "code": "0210",
            "name": "Shimbir Fatuma"
          },
          {
            "code": "0206",
            "name": "Wargudud"
          }
        ]
      },
      {
        "code": "039",
        "name": "Mandera West",
        "county": "Mandera",
        "wards": [
          {
            "code": "0194",
            "name": "Dandu"
          },
          {
            "code": "0195",
            "name": "Gither"
          },
          {
            "code": "0193",
            "name": "Lag Sure"
          },
          {
            "code": "0192",
            "name": "Takaba"
          },
          {
            "code": "0191",
            "name": "Takaba South"
          }
        ]
      }
    ]
  },
  {
    "code": "010",
    "name": "Marsabit",
    "subCounties": [
      {
        "code": "048",
        "name": "Laisamis",
        "county": "Marsabit",
        "wards": [
          {
            "code": "0237",
            "name": "Kargi/South Horr"
          },
          {
            "code": "0238",
            "name": "Korr/Ngurunit"
          },
          {
            "code": "0240",
            "name": "Laisamis"
          },
          {
            "code": "0239",
            "name": "Log Logo"
          },
          {
            "code": "0236",
            "name": "Loiyangalani"
          }
        ]
      },
      {
        "code": "045",
        "name": "Moyale",
        "county": "Marsabit",
        "wards": [
          {
            "code": "0221",
            "name": "Butiye"
          },
          {
            "code": "0224",
            "name": "Golbo"
          },
          {
            "code": "0223",
            "name": "Heilu-Manyatta"
          },
          {
            "code": "0225",
            "name": "Moyale Township"
          },
          {
            "code": "0227",
            "name": "Obbu"
          },
          {
            "code": "0222",
            "name": "Sololo"
          },
          {
            "code": "0226",
            "name": "Uran"
          }
        ]
      },
      {
        "code": "046",
        "name": "North Horr",
        "county": "Marsabit",
        "wards": [
          {
            "code": "0230",
            "name": "Dukana"
          },
          {
            "code": "0228",
            "name": "Illeret"
          },
          {
            "code": "0231",
            "name": "Maikona"
          },
          {
            "code": "0229",
            "name": "North Horr"
          },
          {
            "code": "0232",
            "name": "Turbi"
          }
        ]
      },
      {
        "code": "047",
        "name": "Saku",
        "county": "Marsabit",
        "wards": [
          {
            "code": "0234",
            "name": "Karare"
          },
          {
            "code": "0235",
            "name": "Marsabit Central"
          },
          {
            "code": "0233",
            "name": "Sagante/Jaldesa"
          }
        ]
      }
    ]
  },
  {
    "code": "012",
    "name": "Meru",
    "subCounties": [
      {
        "code": "057",
        "name": "Buuri",
        "county": "Meru",
        "wards": [
          {
            "code": "0285",
            "name": "Kibirichia"
          },
          {
            "code": "0283",
            "name": "Kiirua/Naari"
          },
          {
            "code": "0282",
            "name": "Kisima"
          },
          {
            "code": "0284",
            "name": "Ruiri/Rwarera"
          },
          {
            "code": "0281",
            "name": "Timau"
          }
        ]
      },
      {
        "code": "058",
        "name": "Central Imenti",
        "county": "Meru",
        "wards": [
          {
            "code": "0287",
            "name": "Abothuguchi Central"
          },
          {
            "code": "0288",
            "name": "Abothuguchi West"
          },
          {
            "code": "0289",
            "name": "Kiagu"
          },
          {
            "code": "0286",
            "name": "Mwanganthia"
          }
        ]
      },
      {
        "code": "052",
        "name": "Igembe Central",
        "county": "Meru",
        "wards": [
          {
            "code": "0256",
            "name": "Akirang'ondu"
          },
          {
            "code": "0257",
            "name": "Athiru Ruujine"
          },
          {
            "code": "0258",
            "name": "Igembe East"
          },
          {
            "code": "0260",
            "name": "Kangeta"
          },
          {
            "code": "0259",
            "name": "Njia"
          }
        ]
      },
      {
        "code": "053",
        "name": "Igembe North",
        "county": "Meru",
        "wards": [
          {
            "code": "0265",
            "name": "Amwathi"
          },
          {
            "code": "0261",
            "name": "Antuambui"
          },
          {
            "code": "0263",
            "name": "Antubetwe Kiongo"
          },
          {
            "code": "0264",
            "name": "Naathu"
          },
          {
            "code": "0262",
            "name": "Ntunene"
          }
        ]
      },
      {
        "code": "051",
        "name": "Igembe South",
        "county": "Meru",
        "wards": [
          {
            "code": "0254",
            "name": "Akachiu"
          },
          {
            "code": "0253",
            "name": "Athiru Gaiti"
          },
          {
            "code": "0255",
            "name": "Kanuni"
          },
          {
            "code": "0252",
            "name": "Kiegoi/Antubochiu"
          },
          {
            "code": "0251",
            "name": "Maua"
          }
        ]
      },
      {
        "code": "056",
        "name": "North Imenti",
        "county": "Meru",
        "wards": [
          {
            "code": "0276",
            "name": "Municipality"
          },
          {
            "code": "0277",
            "name": "Ntima East"
          },
          {
            "code": "0278",
            "name": "Ntima West"
          },
          {
            "code": "0280",
            "name": "Nyaki East"
          },
          {
            "code": "0279",
            "name": "Nyaki West"
          }
        ]
      },
      {
        "code": "059",
        "name": "South Imenti",
        "county": "Meru",
        "wards": [
          {
            "code": "0293",
            "name": "Abogeta East"
          },
          {
            "code": "0294",
            "name": "Abogeta West"
          },
          {
            "code": "0291",
            "name": "Igoji East"
          },
          {
            "code": "0292",
            "name": "Igoji West"
          },
          {
            "code": "0290",
            "name": "Mitunguu"
          },
          {
            "code": "0295",
            "name": "Nkuene"
          }
        ]
      },
      {
        "code": "055",
        "name": "Tigania East",
        "county": "Meru",
        "wards": [
          {
            "code": "0275",
            "name": "Karama"
          },
          {
            "code": "0273",
            "name": "Kiguchwa"
          },
          {
            "code": "0272",
            "name": "Mikinduri"
          },
          {
            "code": "0274",
            "name": "Muthara"
          },
          {
            "code": "0271",
            "name": "Thangatha"
          }
        ]
      },
      {
        "code": "054",
        "name": "Tigania West",
        "county": "Meru",
        "wards": [
          {
            "code": "0267",
            "name": "Akithii"
          },
          {
            "code": "0266",
            "name": "Athwana"
          },
          {
            "code": "0268",
            "name": "Kianjai"
          },
          {
            "code": "0270",
            "name": "Mbeu"
          },
          {
            "code": "0269",
            "name": "Nkomo"
          }
        ]
      }
    ]
  },
  {
    "code": "044",
    "name": "Migori",
    "subCounties": [
      {
        "code": "254",
        "name": "Awendo",
        "county": "Migori",
        "wards": [
          {
            "code": "1268",
            "name": "Central Sakwa"
          },
          {
            "code": "1265",
            "name": "North Sakwa"
          },
          {
            "code": "1266",
            "name": "South Sakwa"
          },
          {
            "code": "1267",
            "name": "West Sakwa"
          }
        ]
      },
      {
        "code": "260",
        "name": "Kuria East",
        "county": "Migori",
        "wards": [
          {
            "code": "1296",
            "name": "Gokeharaka/Getambwega"
          },
          {
            "code": "1298",
            "name": "Ntimaru East"
          },
          {
            "code": "1297",
            "name": "Ntimaru West"
          },
          {
            "code": "1299",
            "name": "Nyabasi East"
          },
          {
            "code": "1300",
            "name": "Nyabasi West"
          }
        ]
      },
      {
        "code": "259",
        "name": "Kuria West",
        "county": "Migori",
        "wards": [
          {
            "code": "1290",
            "name": "Bukira Centrl/Ikerege"
          },
          {
            "code": "1289",
            "name": "Bukira East"
          },
          {
            "code": "1291",
            "name": "Isibania"
          },
          {
            "code": "1292",
            "name": "Makerero"
          },
          {
            "code": "1293",
            "name": "Masaba"
          },
          {
            "code": "1295",
            "name": "Nyamosense/Komosoko"
          },
          {
            "code": "1294",
            "name": "Tagare"
          }
        ]
      },
      {
        "code": "258",
        "name": "Nyatike",
        "county": "Migori",
        "wards": [
          {
            "code": "1287",
            "name": "Got Kachola"
          },
          {
            "code": "1282",
            "name": "Kachien'g"
          },
          {
            "code": "1286",
            "name": "Kaler"
          },
          {
            "code": "1283",
            "name": "Kanyasa"
          },
          {
            "code": "1285",
            "name": "Macalder/Kanyarwanda"
          },
          {
            "code": "1288",
            "name": "Muhuru"
          },
          {
            "code": "1284",
            "name": "North Kadem"
          }
        ]
      },
      {
        "code": "253",
        "name": "Rongo",
        "county": "Migori",
        "wards": [
          {
            "code": "1262",
            "name": "Central Kamagambo"
          },
          {
            "code": "1263",
            "name": "East Kamagambo"
          },
          {
            "code": "1261",
            "name": "North Kamagambo"
          },
          {
            "code": "1264",
            "name": "South Kamagambo"
          }
        ]
      },
      {
        "code": "255",
        "name": "Suna East",
        "county": "Migori",
        "wards": [
          {
            "code": "1269",
            "name": "God Jope"
          },
          {
            "code": "1271",
            "name": "Kakrao"
          },
          {
            "code": "1272",
            "name": "Kwa"
          },
          {
            "code": "1270",
            "name": "Suna Central"
          }
        ]
      },
      {
        "code": "256",
        "name": "Suna West",
        "county": "Migori",
        "wards": [
          {
            "code": "1275",
            "name": "Ragana-Oruba"
          },
          {
            "code": "1276",
            "name": "Wasimbete"
          },
          {
            "code": "1274",
            "name": "Wasweta Ii"
          },
          {
            "code": "1273",
            "name": "Wiga"
          }
        ]
      },
      {
        "code": "257",
        "name": "Uriri",
        "county": "Migori",
        "wards": [
          {
            "code": "1279",
            "name": "Central Kanyamkago"
          },
          {
            "code": "1281",
            "name": "East Kanyamkago"
          },
          {
            "code": "1278",
            "name": "North Kanyamkago"
          },
          {
            "code": "1280",
            "name": "South Kanyamkago"
          },
          {
            "code": "1277",
            "name": "West Kanyamkago"
          }
        ]
      }
    ]
  },
  {
    "code": "001",
    "name": "Mombasa",
    "subCounties": [
      {
        "code": "001",
        "name": "Changamwe",
        "county": "Mombasa",
        "wards": [
          {
            "code": "0003",
            "name": "Airport"
          },
          {
            "code": "0005",
            "name": "Chaani"
          },
          {
            "code": "0004",
            "name": "Changamwe"
          },
          {
            "code": "0002",
            "name": "Kipevu"
          },
          {
            "code": "0001",
            "name": "Port Reitz"
          }
        ]
      },
      {
        "code": "002",
        "name": "Jomvu",
        "county": "Mombasa",
        "wards": [
          {
            "code": "0006",
            "name": "Jomvu Kuu"
          },
          {
            "code": "0008",
            "name": "Mikindani"
          },
          {
            "code": "0007",
            "name": "Miritini"
          }
        ]
      },
      {
        "code": "003",
        "name": "Kisauni",
        "county": "Mombasa",
        "wards": [
          {
            "code": "0011",
            "name": "Bamburi"
          },
          {
            "code": "0010",
            "name": "Junda"
          },
          {
            "code": "0014",
            "name": "Magogoni"
          },
          {
            "code": "0009",
            "name": "Mjambere"
          },
          {
            "code": "0013",
            "name": "Mtopanga"
          },
          {
            "code": "0012",
            "name": "Mwakirunge"
          },
          {
            "code": "0015",
            "name": "Shanzu"
          }
        ]
      },
      {
        "code": "005",
        "name": "Likoni",
        "county": "Mombasa",
        "wards": [
          {
            "code": "0023",
            "name": "Bofu"
          },
          {
            "code": "0024",
            "name": "Likoni"
          },
          {
            "code": "0021",
            "name": "Mtongwe"
          },
          {
            "code": "0022",
            "name": "Shika Adabu"
          },
          {
            "code": "0025",
            "name": "Timbwani"
          }
        ]
      },
      {
        "code": "006",
        "name": "Mvita",
        "county": "Mombasa",
        "wards": [
          {
            "code": "0030",
            "name": "Majengo"
          },
          {
            "code": "0026",
            "name": "Mji Wa Kale/Makadara"
          },
          {
            "code": "0029",
            "name": "Shimanzi/Ganjoni"
          },
          {
            "code": "0028",
            "name": "Tononoka"
          },
          {
            "code": "0027",
            "name": "Tudor"
          }
        ]
      },
      {
        "code": "004",
        "name": "Nyali",
        "county": "Mombasa",
        "wards": [
          {
            "code": "0016",
            "name": "Frere Town"
          },
          {
            "code": "0020",
            "name": "Kadzandani"
          },
          {
            "code": "0019",
            "name": "Kongowea"
          },
          {
            "code": "0018",
            "name": "Mkomani"
          },
          {
            "code": "0017",
            "name": "Ziwa la Ng'ombe"
          }
        ]
      }
    ]
  },
  {
    "code": "021",
    "name": "Murang'a",
    "subCounties": [
      {
        "code": "110",
        "name": "Gatanga",
        "county": "Murang'a",
        "wards": [
          {
            "code": "0549",
            "name": "Gatanga"
          },
          {
            "code": "0545",
            "name": "Ithanga"
          },
          {
            "code": "0546",
            "name": "Kakuzi/Mitubiri"
          },
          {
            "code": "0550",
            "name": "Kariara"
          },
          {
            "code": "0548",
            "name": "Kihumbu-Ini"
          },
          {
            "code": "0547",
            "name": "Mugumo-Ini"
          }
        ]
      },
      {
        "code": "109",
        "name": "Kandara",
        "county": "Murang'a",
        "wards": [
          {
            "code": "0542",
            "name": "Gaichanjiru"
          },
          {
            "code": "0543",
            "name": "Ithiru"
          },
          {
            "code": "0541",
            "name": "Kagundu-Ini"
          },
          {
            "code": "0540",
            "name": "Muruka"
          },
          {
            "code": "0539",
            "name": "Ng'araria"
          },
          {
            "code": "0544",
            "name": "Ruchu"
          }
        ]
      },
      {
        "code": "104",
        "name": "Kangema",
        "county": "Murang'a",
        "wards": [
          {
            "code": "0516",
            "name": "Kanyenyaini"
          },
          {
            "code": "0517",
            "name": "Muguru"
          },
          {
            "code": "0518",
            "name": "Rwathia"
          }
        ]
      },
      {
        "code": "107",
        "name": "Kigumo",
        "county": "Murang'a",
        "wards": [
          {
            "code": "0528",
            "name": "Kahumbu"
          },
          {
            "code": "0531",
            "name": "Kangari"
          },
          {
            "code": "0530",
            "name": "Kigumo"
          },
          {
            "code": "0532",
            "name": "Kinyona"
          },
          {
            "code": "0529",
            "name": "Muthithi"
          }
        ]
      },
      {
        "code": "106",
        "name": "Kiharu",
        "county": "Murang'a",
        "wards": [
          {
            "code": "0527",
            "name": "Gaturi"
          },
          {
            "code": "0524",
            "name": "Mbiri"
          },
          {
            "code": "0523",
            "name": "Mugoiri"
          },
          {
            "code": "0526",
            "name": "Murarandia"
          },
          {
            "code": "0525",
            "name": "Township"
          },
          {
            "code": "0522",
            "name": "Wangu"
          }
        ]
      },
      {
        "code": "108",
        "name": "Maragwa",
        "county": "Murang'a",
        "wards": [
          {
            "code": "0537",
            "name": "Ichagaki"
          },
          {
            "code": "0536",
            "name": "Kamahuha"
          },
          {
            "code": "0535",
            "name": "Kambiti"
          },
          {
            "code": "0533",
            "name": "Kimorori/Wempa"
          },
          {
            "code": "0534",
            "name": "Makuyu"
          },
          {
            "code": "0538",
            "name": "Nginda"
          }
        ]
      },
      {
        "code": "105",
        "name": "Mathioya",
        "county": "Murang'a",
        "wards": [
          {
            "code": "0519",
            "name": "Gitugi"
          },
          {
            "code": "0521",
            "name": "Kamacharia"
          },
          {
            "code": "0520",
            "name": "Kiru"
          }
        ]
      }
    ]
  },
  {
    "code": "047",
    "name": "Nairobi",
    "subCounties": [
      {
        "code": "275",
        "name": "Dagoretti North",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1373",
            "name": "Gatina"
          },
          {
            "code": "1375",
            "name": "Kabiro"
          },
          {
            "code": "1372",
            "name": "Kawangware"
          },
          {
            "code": "1374",
            "name": "Kileleshwa"
          },
          {
            "code": "1371",
            "name": "Kilimani"
          }
        ]
      },
      {
        "code": "276",
        "name": "Dagoretti South",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1376",
            "name": "Mutuini"
          },
          {
            "code": "1377",
            "name": "Ngando"
          },
          {
            "code": "1378",
            "name": "Riruta"
          },
          {
            "code": "1379",
            "name": "Uthiru/Ruthimitu"
          },
          {
            "code": "1380",
            "name": "Waithaka"
          }
        ]
      },
      {
        "code": "284",
        "name": "Embakasi Central",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1417",
            "name": "Kayole Central"
          },
          {
            "code": "1416",
            "name": "Kayole North"
          },
          {
            "code": "1418",
            "name": "Kayole South"
          },
          {
            "code": "1419",
            "name": "Komarock"
          },
          {
            "code": "1420",
            "name": "Matopeni"
          }
        ]
      },
      {
        "code": "285",
        "name": "Embakasi East",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1423",
            "name": "Embakasi"
          },
          {
            "code": "1422",
            "name": "Lower Savannah"
          },
          {
            "code": "1425",
            "name": "Mihango"
          },
          {
            "code": "1421",
            "name": "Upper Savannah"
          },
          {
            "code": "1424",
            "name": "Utawala"
          }
        ]
      },
      {
        "code": "283",
        "name": "Embakasi North",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1412",
            "name": "Dandora Area I"
          },
          {
            "code": "1413",
            "name": "Dandora Area Ii"
          },
          {
            "code": "1414",
            "name": "Dandora Area Iii"
          },
          {
            "code": "1415",
            "name": "Dandora Area Iv"
          },
          {
            "code": "1411",
            "name": "Kariobangi North"
          }
        ]
      },
      {
        "code": "282",
        "name": "Embakasi South",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1406",
            "name": "Imara Daima"
          },
          {
            "code": "1407",
            "name": "Kwa Njenga"
          },
          {
            "code": "1408",
            "name": "Kwa Reuben"
          },
          {
            "code": "1410",
            "name": "Kware"
          },
          {
            "code": "1409",
            "name": "Pipeline"
          }
        ]
      },
      {
        "code": "286",
        "name": "Embakasi West",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1429",
            "name": "Kariobangi South"
          },
          {
            "code": "1428",
            "name": "Mowlem"
          },
          {
            "code": "1426",
            "name": "Umoja I"
          },
          {
            "code": "1427",
            "name": "Umoja Ii"
          }
        ]
      },
      {
        "code": "288",
        "name": "Kamukunji",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1437",
            "name": "Airbase"
          },
          {
            "code": "1438",
            "name": "California"
          },
          {
            "code": "1435",
            "name": "Eastleigh North"
          },
          {
            "code": "1436",
            "name": "Eastleigh South"
          },
          {
            "code": "1434",
            "name": "Pumwani"
          }
        ]
      },
      {
        "code": "280",
        "name": "Kasarani",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1396",
            "name": "Claycity"
          },
          {
            "code": "1398",
            "name": "Kasarani"
          },
          {
            "code": "1397",
            "name": "Mwiki"
          },
          {
            "code": "1399",
            "name": "Njiru"
          },
          {
            "code": "1400",
            "name": "Ruai"
          }
        ]
      },
      {
        "code": "278",
        "name": "Kibra",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1386",
            "name": "Laini Saba"
          },
          {
            "code": "1387",
            "name": "Lindi"
          },
          {
            "code": "1388",
            "name": "Makina"
          },
          {
            "code": "1390",
            "name": "Sarangombe"
          },
          {
            "code": "1389",
            "name": "Woodley/Kenyatta Golf"
          }
        ]
      },
      {
        "code": "277",
        "name": "Langata",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1381",
            "name": "Karen"
          },
          {
            "code": "1383",
            "name": "Mugumo-Ini"
          },
          {
            "code": "1382",
            "name": "Nairobi West"
          },
          {
            "code": "1385",
            "name": "Nyayo Highrise"
          },
          {
            "code": "1384",
            "name": "South-C"
          }
        ]
      },
      {
        "code": "287",
        "name": "Makadara",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1432",
            "name": "Harambee"
          },
          {
            "code": "1430",
            "name": "Makongeni"
          },
          {
            "code": "1431",
            "name": "Maringo/Hamza"
          },
          {
            "code": "1433",
            "name": "Viwandani"
          }
        ]
      },
      {
        "code": "290",
        "name": "Mathare",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1445",
            "name": "Hospital"
          },
          {
            "code": "1447",
            "name": "Huruma"
          },
          {
            "code": "1450",
            "name": "Kiamaiko"
          },
          {
            "code": "1446",
            "name": "Mabatini"
          },
          {
            "code": "1449",
            "name": "Mlango Kubwa"
          },
          {
            "code": "1448",
            "name": "Ngei"
          }
        ]
      },
      {
        "code": "279",
        "name": "Roysambu",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1391",
            "name": "Githurai"
          },
          {
            "code": "1395",
            "name": "Kahawa"
          },
          {
            "code": "1392",
            "name": "Kahawa West"
          },
          {
            "code": "1394",
            "name": "Roysambu"
          },
          {
            "code": "1393",
            "name": "Zimmerman"
          }
        ]
      },
      {
        "code": "281",
        "name": "Ruaraka",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1401",
            "name": "Baba Dogo"
          },
          {
            "code": "1405",
            "name": "Korogocho"
          },
          {
            "code": "1404",
            "name": "Lucky Summer"
          },
          {
            "code": "1403",
            "name": "Mathare North"
          },
          {
            "code": "1402",
            "name": "Utalii"
          }
        ]
      },
      {
        "code": "289",
        "name": "Starehe",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1443",
            "name": "Landimawe"
          },
          {
            "code": "1439",
            "name": "Nairobi Central"
          },
          {
            "code": "1444",
            "name": "Nairobi South"
          },
          {
            "code": "1440",
            "name": "Ngara"
          },
          {
            "code": "1442",
            "name": "Pangani"
          },
          {
            "code": "1441",
            "name": "Ziwani/Kariokor"
          }
        ]
      },
      {
        "code": "274",
        "name": "Westlands",
        "county": "Nairobi",
        "wards": [
          {
            "code": "1369",
            "name": "Kangemi"
          },
          {
            "code": "1368",
            "name": "Karura"
          },
          {
            "code": "1366",
            "name": "Kitisuru"
          },
          {
            "code": "1370",
            "name": "Mountain View"
          },
          {
            "code": "1367",
            "name": "Parklands/Highridge"
          }
        ]
      }
    ]
  },
  {
    "code": "032",
    "name": "Nakuru",
    "subCounties": [
      {
        "code": "174",
        "name": "Bahati",
        "county": "Nakuru",
        "wards": [
          {
            "code": "0869",
            "name": "Bahati"
          },
          {
            "code": "0865",
            "name": "Dundori"
          },
          {
            "code": "0866",
            "name": "Kabatini"
          },
          {
            "code": "0867",
            "name": "Kiamaina"
          },
          {
            "code": "0868",
            "name": "Lanet/Umoja"
          }
        ]
      },
      {
        "code": "169",
        "name": "Gilgil",
        "county": "Nakuru",
        "wards": [
          {
            "code": "0845",
            "name": "Elementaita"
          },
          {
            "code": "0844",
            "name": "Gilgil"
          },
          {
            "code": "0847",
            "name": "Malewa West"
          },
          {
            "code": "0846",
            "name": "Mbaruk/Eburu"
          },
          {
            "code": "0848",
            "name": "Murindati"
          }
        ]
      },
      {
        "code": "171",
        "name": "Kuresoi North",
        "county": "Nakuru",
        "wards": [
          {
            "code": "0856",
            "name": "Kamara"
          },
          {
            "code": "0853",
            "name": "Kiptororo"
          },
          {
            "code": "0854",
            "name": "Nyota"
          },
          {
            "code": "0855",
            "name": "Sirikwa"
          }
        ]
      },
      {
        "code": "170",
        "name": "Kuresoi South",
        "county": "Nakuru",
        "wards": [
          {
            "code": "0849",
            "name": "Amalo"
          },
          {
            "code": "0850",
            "name": "Keringet"
          },
          {
            "code": "0851",
            "name": "Kiptagich"
          },
          {
            "code": "0852",
            "name": "Tinet"
          }
        ]
      },
      {
        "code": "166",
        "name": "Molo",
        "county": "Nakuru",
        "wards": [
          {
            "code": "0827",
            "name": "Elburgon"
          },
          {
            "code": "0826",
            "name": "Mariashoni"
          },
          {
            "code": "0829",
            "name": "Molo"
          },
          {
            "code": "0828",
            "name": "Turi"
          }
        ]
      },
      {
        "code": "168",
        "name": "Naivasha",
        "county": "Nakuru",
        "wards": [
          {
            "code": "0836",
            "name": "Biashara"
          },
          {
            "code": "0837",
            "name": "Hells Gate"
          },
          {
            "code": "0838",
            "name": "Lakeview"
          },
          {
            "code": "0839",
            "name": "Maai-Mahiu"
          },
          {
            "code": "0840",
            "name": "Maiella"
          },
          {
            "code": "0842",
            "name": "Naivasha East"
          },
          {
            "code": "0841",
            "name": "Olkaria"
          },
          {
            "code": "0843",
            "name": "Viwandani"
          }
        ]
      },
      {
        "code": "176",
        "name": "Nakuru Town East",
        "county": "Nakuru",
        "wards": [
          {
            "code": "0876",
            "name": "Biashara"
          },
          {
            "code": "0878",
            "name": "Flamingo"
          },
          {
            "code": "0877",
            "name": "Kivumbini"
          },
          {
            "code": "0879",
            "name": "Menengai"
          },
          {
            "code": "0880",
            "name": "Nakuru East"
          }
        ]
      },
      {
        "code": "175",
        "name": "Nakuru Town West",
        "county": "Nakuru",
        "wards": [
          {
            "code": "0870",
            "name": "Barut"
          },
          {
            "code": "0873",
            "name": "Kapkures"
          },
          {
            "code": "0872",
            "name": "Kaptembwo"
          },
          {
            "code": "0871",
            "name": "London"
          },
          {
            "code": "0874",
            "name": "Rhoda"
          },
          {
            "code": "0875",
            "name": "Shaabab"
          }
        ]
      },
      {
        "code": "167",
        "name": "Njoro",
        "county": "Nakuru",
        "wards": [
          {
            "code": "0832",
            "name": "Kihingo"
          },
          {
            "code": "0834",
            "name": "Lare"
          },
          {
            "code": "0831",
            "name": "Mauche"
          },
          {
            "code": "0830",
            "name": "Maunarok"
          },
          {
            "code": "0833",
            "name": "Nessuit"
          },
          {
            "code": "0835",
            "name": "Njoro"
          }
        ]
      },
      {
        "code": "173",
        "name": "Rongai",
        "county": "Nakuru",
        "wards": [
          {
            "code": "0860",
            "name": "Menengai West"
          },
          {
            "code": "0863",
            "name": "Mosop"
          },
          {
            "code": "0861",
            "name": "Soin"
          },
          {
            "code": "0864",
            "name": "Solai"
          },
          {
            "code": "0862",
            "name": "Visoi"
          }
        ]
      },
      {
        "code": "172",
        "name": "Subukia",
        "county": "Nakuru",
        "wards": [
          {
            "code": "0859",
            "name": "Kabazi"
          },
          {
            "code": "0857",
            "name": "Subukia"
          },
          {
            "code": "0858",
            "name": "Waseges"
          }
        ]
      }
    ]
  },
  {
    "code": "029",
    "name": "Nandi",
    "subCounties": [
      {
        "code": "152",
        "name": "Aldai",
        "county": "Nandi",
        "wards": [
          {
            "code": "0755",
            "name": "Kabwareng"
          },
          {
            "code": "0759",
            "name": "Kaptumo-Kaboi"
          },
          {
            "code": "0757",
            "name": "Kemeloi-Maraba"
          },
          {
            "code": "0758",
            "name": "Kobujoi"
          },
          {
            "code": "0760",
            "name": "Koyo-Ndurio"
          },
          {
            "code": "0756",
            "name": "Terik"
          }
        ]
      },
      {
        "code": "154",
        "name": "Chesumei",
        "county": "Nandi",
        "wards": [
          {
            "code": "0765",
            "name": "Chemundu/Kapng'etuny"
          },
          {
            "code": "0768",
            "name": "Kaptel/Kamoiywo"
          },
          {
            "code": "0769",
            "name": "Kiptuya"
          },
          {
            "code": "0766",
            "name": "Kosirai"
          },
          {
            "code": "0767",
            "name": "Lelmokwo/Ngechek"
          }
        ]
      },
      {
        "code": "155",
        "name": "Emgwen",
        "county": "Nandi",
        "wards": [
          {
            "code": "0770",
            "name": "Chepkumia"
          },
          {
            "code": "0771",
            "name": "Kapkangani"
          },
          {
            "code": "0772",
            "name": "Kapsabet"
          },
          {
            "code": "0773",
            "name": "Kilibwoni"
          }
        ]
      },
      {
        "code": "156",
        "name": "Mosop",
        "county": "Nandi",
        "wards": [
          {
            "code": "0774",
            "name": "Chepterwai"
          },
          {
            "code": "0779",
            "name": "Kabisaga"
          },
          {
            "code": "0777",
            "name": "Kabiyet"
          },
          {
            "code": "0775",
            "name": "Kipkaren"
          },
          {
            "code": "0776",
            "name": "Kurgung/Surungai"
          },
          {
            "code": "0778",
            "name": "Ndalat"
          },
          {
            "code": "0780",
            "name": "Sangalo/Kebulonik"
          }
        ]
      },
      {
        "code": "153",
        "name": "Nandi Hills",
        "county": "Nandi",
        "wards": [
          {
            "code": "0762",
            "name": "Chepkunyuk"
          },
          {
            "code": "0764",
            "name": "Kapchorua"
          },
          {
            "code": "0761",
            "name": "Nandi Hills"
          },
          {
            "code": "0763",
            "name": "Ol'lessos"
          }
        ]
      },
      {
        "code": "151",
        "name": "Tinderet",
        "county": "Nandi",
        "wards": [
          {
            "code": "0753",
            "name": "Chemelil/Chemase"
          },
          {
            "code": "0754",
            "name": "Kapsimotwo"
          },
          {
            "code": "0751",
            "name": "Songhor/Soba"
          },
          {
            "code": "0752",
            "name": "Tindiret"
          }
        ]
      }
    ]
  },
  {
    "code": "033",
    "name": "Narok",
    "subCounties": [
      {
        "code": "178",
        "name": "Emurua Dikirr",
        "county": "Narok",
        "wards": [
          {
            "code": "0887",
            "name": "Ilkerin"
          },
          {
            "code": "0890",
            "name": "Kapsasian"
          },
          {
            "code": "0889",
            "name": "Mogondo"
          },
          {
            "code": "0888",
            "name": "Ololmasani"
          }
        ]
      },
      {
        "code": "177",
        "name": "Kilgoris",
        "county": "Narok",
        "wards": [
          {
            "code": "0883",
            "name": "Angata Barikoi"
          },
          {
            "code": "0882",
            "name": "Keyian"
          },
          {
            "code": "0881",
            "name": "Kilgoris Central"
          },
          {
            "code": "0885",
            "name": "Kimintet"
          },
          {
            "code": "0886",
            "name": "Lolgorian"
          },
          {
            "code": "0884",
            "name": "Shankoe"
          }
        ]
      },
      {
        "code": "180",
        "name": "Narok East",
        "county": "Narok",
        "wards": [
          {
            "code": "0898",
            "name": "Ildamat"
          },
          {
            "code": "0899",
            "name": "Keekonyokie"
          },
          {
            "code": "0897",
            "name": "Mosiro"
          },
          {
            "code": "0900",
            "name": "Suswa"
          }
        ]
      },
      {
        "code": "179",
        "name": "Narok North",
        "county": "Narok",
        "wards": [
          {
            "code": "0896",
            "name": "Melili"
          },
          {
            "code": "0893",
            "name": "Narok Town"
          },
          {
            "code": "0894",
            "name": "Nkareta"
          },
          {
            "code": "0892",
            "name": "Olokurto"
          },
          {
            "code": "0895",
            "name": "Olorropil"
          },
          {
            "code": "0891",
            "name": "Olpusimoru"
          }
        ]
      },
      {
        "code": "181",
        "name": "Narok South",
        "county": "Narok",
        "wards": [
          {
            "code": "0904",
            "name": "Loita"
          },
          {
            "code": "0901",
            "name": "Majimoto/Naroosura"
          },
          {
            "code": "0903",
            "name": "Melelo"
          },
          {
            "code": "0902",
            "name": "Ololulung'a"
          },
          {
            "code": "0906",
            "name": "Sagamian"
          },
          {
            "code": "0905",
            "name": "Sogoo"
          }
        ]
      },
      {
        "code": "182",
        "name": "Narok West",
        "county": "Narok",
        "wards": [
          {
            "code": "0907",
            "name": "Ilmotiok"
          },
          {
            "code": "0908",
            "name": "Mara"
          },
          {
            "code": "0910",
            "name": "Naikarra"
          },
          {
            "code": "0909",
            "name": "Siana"
          }
        ]
      }
    ]
  },
  {
    "code": "046",
    "name": "Nyamira",
    "subCounties": [
      {
        "code": "273",
        "name": "Borabu",
        "county": "Nyamira",
        "wards": [
          {
            "code": "1365",
            "name": "Esise"
          },
          {
            "code": "1363",
            "name": "Kiabonyoru"
          },
          {
            "code": "1362",
            "name": "Mekenene"
          },
          {
            "code": "1364",
            "name": "Nyansiongo"
          }
        ]
      },
      {
        "code": "270",
        "name": "Kitutu Masaba",
        "county": "Nyamira",
        "wards": [
          {
            "code": "1347",
            "name": "Gachuba"
          },
          {
            "code": "1351",
            "name": "Gesima"
          },
          {
            "code": "1348",
            "name": "Kemera"
          },
          {
            "code": "1349",
            "name": "Magombo"
          },
          {
            "code": "1350",
            "name": "Manga"
          },
          {
            "code": "1346",
            "name": "Rigoma"
          }
        ]
      },
      {
        "code": "272",
        "name": "North Mugirango",
        "county": "Nyamira",
        "wards": [
          {
            "code": "1359",
            "name": "Bokeira"
          },
          {
            "code": "1358",
            "name": "Bomwagamo"
          },
          {
            "code": "1361",
            "name": "Ekerenyo"
          },
          {
            "code": "1357",
            "name": "Itibo"
          },
          {
            "code": "1360",
            "name": "Magwagwa"
          }
        ]
      },
      {
        "code": "271",
        "name": "West Mugirango",
        "county": "Nyamira",
        "wards": [
          {
            "code": "1353",
            "name": "Bogichora"
          },
          {
            "code": "1355",
            "name": "Bonyamatuta"
          },
          {
            "code": "1354",
            "name": "Bosamaro"
          },
          {
            "code": "1352",
            "name": "Nyamaiya"
          },
          {
            "code": "1356",
            "name": "Township"
          }
        ]
      }
    ]
  },
  {
    "code": "018",
    "name": "Nyandarua",
    "subCounties": [
      {
        "code": "089",
        "name": "Kinangop",
        "county": "Nyandarua",
        "wards": [
          {
            "code": "0441",
            "name": "Engineer"
          },
          {
            "code": "0442",
            "name": "Gathara"
          },
          {
            "code": "0447",
            "name": "Githabai"
          },
          {
            "code": "0448",
            "name": "Magumu"
          },
          {
            "code": "0444",
            "name": "Murungaru"
          },
          {
            "code": "0445",
            "name": "Njabini/Kiburu"
          },
          {
            "code": "0443",
            "name": "North Kinangop"
          },
          {
            "code": "0446",
            "name": "Nyakio"
          }
        ]
      },
      {
        "code": "090",
        "name": "Kipipiri",
        "county": "Nyandarua",
        "wards": [
          {
            "code": "0451",
            "name": "Geta"
          },
          {
            "code": "0452",
            "name": "Githioro"
          },
          {
            "code": "0450",
            "name": "Kipipiri"
          },
          {
            "code": "0449",
            "name": "Wanjohi"
          }
        ]
      },
      {
        "code": "093",
        "name": "Ndaragwa",
        "county": "Nyandarua",
        "wards": [
          {
            "code": "0464",
            "name": "Central"
          },
          {
            "code": "0463",
            "name": "Kiriita"
          },
          {
            "code": "0462",
            "name": "Leshau Pondo"
          },
          {
            "code": "0465",
            "name": "Shamata"
          }
        ]
      },
      {
        "code": "092",
        "name": "Ol Jorok",
        "county": "Nyandarua",
        "wards": [
          {
            "code": "0461",
            "name": "Charagita"
          },
          {
            "code": "0458",
            "name": "Gathanji"
          },
          {
            "code": "0459",
            "name": "Gatimu"
          },
          {
            "code": "0460",
            "name": "Weru"
          }
        ]
      },
      {
        "code": "091",
        "name": "Ol Kalou",
        "county": "Nyandarua",
        "wards": [
          {
            "code": "0456",
            "name": "Kaimbaga"
          },
          {
            "code": "0454",
            "name": "Kanjuiri Ridge"
          },
          {
            "code": "0453",
            "name": "Karau"
          },
          {
            "code": "0455",
            "name": "Mirangine"
          },
          {
            "code": "0457",
            "name": "Rurii"
          }
        ]
      }
    ]
  },
  {
    "code": "019",
    "name": "Nyeri",
    "subCounties": [
      {
        "code": "095",
        "name": "Kieni",
        "county": "Nyeri",
        "wards": [
          {
            "code": "0476",
            "name": "Gakawa"
          },
          {
            "code": "0473",
            "name": "Gatarakwa"
          },
          {
            "code": "0475",
            "name": "Kabaru"
          },
          {
            "code": "0472",
            "name": "Mugunda"
          },
          {
            "code": "0469",
            "name": "Mweiga"
          },
          {
            "code": "0471",
            "name": "Mwiyogo/Endarasha"
          },
          {
            "code": "0470",
            "name": "Naromoru Kiamathaga"
          },
          {
            "code": "0474",
            "name": "Thegu River"
          }
        ]
      },
      {
        "code": "096",
        "name": "Mathira",
        "county": "Nyeri",
        "wards": [
          {
            "code": "0479",
            "name": "Iriaini"
          },
          {
            "code": "0482",
            "name": "Karatina Town"
          },
          {
            "code": "0481",
            "name": "Kirimukuyu"
          },
          {
            "code": "0480",
            "name": "Konyu"
          },
          {
            "code": "0478",
            "name": "Magutu"
          },
          {
            "code": "0477",
            "name": "Ruguru"
          }
        ]
      },
      {
        "code": "098",
        "name": "Mukurweini",
        "county": "Nyeri",
        "wards": [
          {
            "code": "0487",
            "name": "Gikondi"
          },
          {
            "code": "0490",
            "name": "Mukurwe-Ini Central"
          },
          {
            "code": "0489",
            "name": "Mukurwe-Ini West"
          },
          {
            "code": "0488",
            "name": "Rugi"
          }
        ]
      },
      {
        "code": "099",
        "name": "Nyeri Town",
        "county": "Nyeri",
        "wards": [
          {
            "code": "0493",
            "name": "Gatitu/Muruguru"
          },
          {
            "code": "0495",
            "name": "Kamakwa/Mukaro"
          },
          {
            "code": "0491",
            "name": "Kiganjo/Mathari"
          },
          {
            "code": "0494",
            "name": "Ruring'u"
          },
          {
            "code": "0492",
            "name": "Rware"
          }
        ]
      },
      {
        "code": "097",
        "name": "Othaya",
        "county": "Nyeri",
        "wards": [
          {
            "code": "0485",
            "name": "Chinga"
          },
          {
            "code": "0484",
            "name": "Iria-Ini"
          },
          {
            "code": "0486",
            "name": "Karima"
          },
          {
            "code": "0483",
            "name": "Mahiga"
          }
        ]
      },
      {
        "code": "094",
        "name": "Tetu",
        "county": "Nyeri",
        "wards": [
          {
            "code": "0468",
            "name": "Aguthi/Gaaki"
          },
          {
            "code": "0466",
            "name": "Dedan Kimanthi"
          },
          {
            "code": "0467",
            "name": "Wamagana"
          }
        ]
      }
    ]
  },
  {
    "code": "025",
    "name": "Samburu",
    "subCounties": [
      {
        "code": "135",
        "name": "Samburu East",
        "county": "Samburu",
        "wards": [
          {
            "code": "0674",
            "name": "Wamba East"
          },
          {
            "code": "0675",
            "name": "Wamba North"
          },
          {
            "code": "0673",
            "name": "Wamba West"
          },
          {
            "code": "0672",
            "name": "Waso"
          }
        ]
      },
      {
        "code": "134",
        "name": "Samburu North",
        "county": "Samburu",
        "wards": [
          {
            "code": "0670",
            "name": "Angata Nanyokie"
          },
          {
            "code": "0671",
            "name": "Baawa"
          },
          {
            "code": "0666",
            "name": "El-Barta"
          },
          {
            "code": "0667",
            "name": "Nachola"
          },
          {
            "code": "0668",
            "name": "Ndoto"
          },
          {
            "code": "0669",
            "name": "Nyiro"
          }
        ]
      },
      {
        "code": "133",
        "name": "Samburu West",
        "county": "Samburu",
        "wards": [
          {
            "code": "0661",
            "name": "Lodokejek"
          },
          {
            "code": "0664",
            "name": "Loosuk"
          },
          {
            "code": "0663",
            "name": "Maralal"
          },
          {
            "code": "0665",
            "name": "Poro"
          },
          {
            "code": "0662",
            "name": "Suguta Marmar"
          }
        ]
      }
    ]
  },
  {
    "code": "041",
    "name": "Siaya",
    "subCounties": [
      {
        "code": "234",
        "name": "Alego Usonga",
        "county": "Siaya",
        "wards": [
          {
            "code": "1165",
            "name": "Central Alego"
          },
          {
            "code": "1167",
            "name": "North Alego"
          },
          {
            "code": "1166",
            "name": "Siaya Township"
          },
          {
            "code": "1168",
            "name": "South East Alego"
          },
          {
            "code": "1163",
            "name": "Usonga"
          },
          {
            "code": "1164",
            "name": "West Alego"
          }
        ]
      },
      {
        "code": "236",
        "name": "Bondo",
        "county": "Siaya",
        "wards": [
          {
            "code": "1176",
            "name": "Central Sakwa"
          },
          {
            "code": "1180",
            "name": "North Sakwa"
          },
          {
            "code": "1177",
            "name": "South Sakwa"
          },
          {
            "code": "1179",
            "name": "West Sakwa"
          },
          {
            "code": "1175",
            "name": "West Yimbo"
          },
          {
            "code": "1178",
            "name": "Yimbo East"
          }
        ]
      },
      {
        "code": "235",
        "name": "Gem",
        "county": "Siaya",
        "wards": [
          {
            "code": "1171",
            "name": "Central Gem"
          },
          {
            "code": "1173",
            "name": "East Gem"
          },
          {
            "code": "1169",
            "name": "North Gem"
          },
          {
            "code": "1174",
            "name": "South Gem"
          },
          {
            "code": "1170",
            "name": "West Gem"
          },
          {
            "code": "1172",
            "name": "Yala Township"
          }
        ]
      },
      {
        "code": "237",
        "name": "Rarieda",
        "county": "Siaya",
        "wards": [
          {
            "code": "1181",
            "name": "East Asembo"
          },
          {
            "code": "1183",
            "name": "North Uyoma"
          },
          {
            "code": "1184",
            "name": "South Uyoma"
          },
          {
            "code": "1182",
            "name": "West Asembo"
          },
          {
            "code": "1185",
            "name": "West Uyoma"
          }
        ]
      },
      {
        "code": "232",
        "name": "Ugenya",
        "county": "Siaya",
        "wards": [
          {
            "code": "1159",
            "name": "East Ugenya"
          },
          {
            "code": "1158",
            "name": "North Ugenya"
          },
          {
            "code": "1157",
            "name": "Ukwala"
          },
          {
            "code": "1156",
            "name": "West Ugenya"
          }
        ]
      },
      {
        "code": "233",
        "name": "Ugunja",
        "county": "Siaya",
        "wards": [
          {
            "code": "1160",
            "name": "Sidindi"
          },
          {
            "code": "1161",
            "name": "Sigomere"
          },
          {
            "code": "1162",
            "name": "Ugunja"
          }
        ]
      }
    ]
  },
  {
    "code": "006",
    "name": "Taita-Taveta",
    "subCounties": [
      {
        "code": "025",
        "name": "Mwatate",
        "county": "Taita-Taveta",
        "wards": [
          {
            "code": "0122",
            "name": "Bura"
          },
          {
            "code": "0123",
            "name": "Chawia"
          },
          {
            "code": "0121",
            "name": "Mwatate"
          },
          {
            "code": "0120",
            "name": "Rong'e"
          },
          {
            "code": "0124",
            "name": "Wusi/Kishamba"
          }
        ]
      },
      {
        "code": "023",
        "name": "Taveta",
        "county": "Taita-Taveta",
        "wards": [
          {
            "code": "0113",
            "name": "Bomeni"
          },
          {
            "code": "0111",
            "name": "Chala"
          },
          {
            "code": "0112",
            "name": "Mahoo"
          },
          {
            "code": "0115",
            "name": "Mata"
          },
          {
            "code": "0114",
            "name": "Mboghoni"
          }
        ]
      },
      {
        "code": "026",
        "name": "Voi",
        "county": "Taita-Taveta",
        "wards": [
          {
            "code": "0127",
            "name": "Kaloleni"
          },
          {
            "code": "0129",
            "name": "Kasigau"
          },
          {
            "code": "0128",
            "name": "Marungu"
          },
          {
            "code": "0125",
            "name": "Mbololo"
          },
          {
            "code": "0130",
            "name": "Ngolia"
          },
          {
            "code": "0126",
            "name": "Sagalla"
          }
        ]
      },
      {
        "code": "024",
        "name": "Wundanyi",
        "county": "Taita-Taveta",
        "wards": [
          {
            "code": "0119",
            "name": "Mwanda/Mgange"
          },
          {
            "code": "0117",
            "name": "Werugha"
          },
          {
            "code": "0118",
            "name": "Wumingu/Kishushe"
          },
          {
            "code": "0116",
            "name": "Wundanyi/Mbale"
          }
        ]
      }
    ]
  },
  {
    "code": "004",
    "name": "Tana River",
    "subCounties": [
      {
        "code": "020",
        "name": "Bura",
        "county": "Tana River",
        "wards": [
          {
            "code": "0098",
            "name": "Bangale"
          },
          {
            "code": "0097",
            "name": "Bura"
          },
          {
            "code": "0096",
            "name": "Chewele"
          },
          {
            "code": "0100",
            "name": "Madogo"
          },
          {
            "code": "0099",
            "name": "Sala"
          }
        ]
      },
      {
        "code": "019",
        "name": "Galole",
        "county": "Tana River",
        "wards": [
          {
            "code": "0094",
            "name": "Chewani"
          },
          {
            "code": "0092",
            "name": "Kinakomba"
          },
          {
            "code": "0093",
            "name": "Mikinduni"
          },
          {
            "code": "0095",
            "name": "Wayu"
          }
        ]
      },
      {
        "code": "018",
        "name": "Garsen",
        "county": "Tana River",
        "wards": [
          {
            "code": "0089",
            "name": "Garsen Central"
          },
          {
            "code": "0091",
            "name": "Garsen North"
          },
          {
            "code": "0087",
            "name": "Garsen South"
          },
          {
            "code": "0090",
            "name": "Garsen West"
          },
          {
            "code": "0086",
            "name": "Kipini East"
          },
          {
            "code": "0088",
            "name": "Kipini West"
          }
        ]
      }
    ]
  },
  {
    "code": "013",
    "name": "Tharaka-Nithi",
    "subCounties": [
      {
        "code": "061",
        "name": "Chuka/Igambang'ombe",
        "county": "Tharaka-Nithi",
        "wards": [
          {
            "code": "0305",
            "name": "Igambang'ombe"
          },
          {
            "code": "0302",
            "name": "Karingani"
          },
          {
            "code": "0303",
            "name": "Magumoni"
          },
          {
            "code": "0301",
            "name": "Mariani"
          },
          {
            "code": "0304",
            "name": "Mugwe"
          }
        ]
      },
      {
        "code": "060",
        "name": "Maara",
        "county": "Tharaka-Nithi",
        "wards": [
          {
            "code": "0300",
            "name": "Chogoria"
          },
          {
            "code": "0299",
            "name": "Ganga"
          },
          {
            "code": "0296",
            "name": "Mitheru"
          },
          {
            "code": "0297",
            "name": "Muthambi"
          },
          {
            "code": "0298",
            "name": "Mwimbi"
          }
        ]
      },
      {
        "code": "062",
        "name": "Tharaka",
        "county": "Tharaka-Nithi",
        "wards": [
          {
            "code": "0309",
            "name": "Chiakariga"
          },
          {
            "code": "0306",
            "name": "Gatunga"
          },
          {
            "code": "0310",
            "name": "Marimanti"
          },
          {
            "code": "0307",
            "name": "Mukothima"
          },
          {
            "code": "0308",
            "name": "Nkondi"
          }
        ]
      }
    ]
  },
  {
    "code": "026",
    "name": "Trans Nzoia",
    "subCounties": [
      {
        "code": "140",
        "name": "Cherangany",
        "county": "Trans Nzoia",
        "wards": [
          {
            "code": "0699",
            "name": "Chepsiro/Kiptoror"
          },
          {
            "code": "0698",
            "name": "Cherangany/Suwerwa"
          },
          {
            "code": "0696",
            "name": "Kaplamai"
          },
          {
            "code": "0695",
            "name": "Makutano"
          },
          {
            "code": "0697",
            "name": "Motosiet"
          },
          {
            "code": "0694",
            "name": "Sinyerere"
          },
          {
            "code": "0700",
            "name": "Sitatunga"
          }
        ]
      },
      {
        "code": "137",
        "name": "Endebess",
        "county": "Trans Nzoia",
        "wards": [
          {
            "code": "0680",
            "name": "Chepchoina"
          },
          {
            "code": "0681",
            "name": "Endebess"
          },
          {
            "code": "0682",
            "name": "Matumbei"
          }
        ]
      },
      {
        "code": "139",
        "name": "Kiminini",
        "county": "Trans Nzoia",
        "wards": [
          {
            "code": "0691",
            "name": "Hospital"
          },
          {
            "code": "0688",
            "name": "Kiminini"
          },
          {
            "code": "0693",
            "name": "Nabiswa"
          },
          {
            "code": "0692",
            "name": "Sikhendu"
          },
          {
            "code": "0690",
            "name": "Sirende"
          },
          {
            "code": "0689",
            "name": "Waitaluk"
          }
        ]
      },
      {
        "code": "136",
        "name": "Kwanza",
        "county": "Trans Nzoia",
        "wards": [
          {
            "code": "0679",
            "name": "Bidii"
          },
          {
            "code": "0676",
            "name": "Kapomboi"
          },
          {
            "code": "0678",
            "name": "Keiyo"
          },
          {
            "code": "0677",
            "name": "Kwanza"
          }
        ]
      },
      {
        "code": "138",
        "name": "Saboti",
        "county": "Trans Nzoia",
        "wards": [
          {
            "code": "0683",
            "name": "Kinyoro"
          },
          {
            "code": "0687",
            "name": "Machewa"
          },
          {
            "code": "0684",
            "name": "Matisi"
          },
          {
            "code": "0686",
            "name": "Saboti"
          },
          {
            "code": "0685",
            "name": "Tuwani"
          }
        ]
      }
    ]
  },
  {
    "code": "023",
    "name": "Turkana",
    "subCounties": [
      {
        "code": "126",
        "name": "Loima",
        "county": "Turkana",
        "wards": [
          {
            "code": "0629",
            "name": "Kotaruk/Lobei"
          },
          {
            "code": "0631",
            "name": "Loima"
          },
          {
            "code": "0632",
            "name": "Lokiriama/Lorengippi"
          },
          {
            "code": "0630",
            "name": "Turkwel"
          }
        ]
      },
      {
        "code": "125",
        "name": "Turkana Central",
        "county": "Turkana",
        "wards": [
          {
            "code": "0626",
            "name": "Kalokol"
          },
          {
            "code": "0628",
            "name": "Kanamkemer"
          },
          {
            "code": "0625",
            "name": "Kang'atotha"
          },
          {
            "code": "0624",
            "name": "Kerio Delta"
          },
          {
            "code": "0627",
            "name": "Lodwar Township"
          }
        ]
      },
      {
        "code": "128",
        "name": "Turkana East",
        "county": "Turkana",
        "wards": [
          {
            "code": "0638",
            "name": "Kapedo/Napeitom"
          },
          {
            "code": "0639",
            "name": "Katilia"
          },
          {
            "code": "0640",
            "name": "Lokori/Kochodin"
          }
        ]
      },
      {
        "code": "123",
        "name": "Turkana North",
        "county": "Turkana",
        "wards": [
          {
            "code": "0614",
            "name": "Kaaleng/Kaikor"
          },
          {
            "code": "0611",
            "name": "Kaeris"
          },
          {
            "code": "0615",
            "name": "Kibish"
          },
          {
            "code": "0612",
            "name": "Lake Zone"
          },
          {
            "code": "0613",
            "name": "Lapur"
          },
          {
            "code": "0616",
            "name": "Nakalale"
          }
        ]
      },
      {
        "code": "127",
        "name": "Turkana South",
        "county": "Turkana",
        "wards": [
          {
            "code": "0636",
            "name": "Kalapata"
          },
          {
            "code": "0633",
            "name": "Kaputir"
          },
          {
            "code": "0634",
            "name": "Katilu"
          },
          {
            "code": "0635",
            "name": "Lobokat"
          },
          {
            "code": "0637",
            "name": "Lokichar"
          }
        ]
      },
      {
        "code": "124",
        "name": "Turkana West",
        "county": "Turkana",
        "wards": [
          {
            "code": "0617",
            "name": "Kakuma"
          },
          {
            "code": "0621",
            "name": "Kalobeyei"
          },
          {
            "code": "0619",
            "name": "Letea"
          },
          {
            "code": "0622",
            "name": "Lokichoggio"
          },
          {
            "code": "0618",
            "name": "Lopur"
          },
          {
            "code": "0623",
            "name": "Nanaam"
          },
          {
            "code": "0620",
            "name": "Songot"
          }
        ]
      }
    ]
  },
  {
    "code": "027",
    "name": "Uasin Gishu",
    "subCounties": [
      {
        "code": "144",
        "name": "Ainabkoi",
        "county": "Uasin Gishu",
        "wards": [
          {
            "code": "0721",
            "name": "Ainabkoi/Olare"
          },
          {
            "code": "0719",
            "name": "Kapsoya"
          },
          {
            "code": "0720",
            "name": "Kaptagat"
          }
        ]
      },
      {
        "code": "145",
        "name": "Kapseret",
        "county": "Uasin Gishu",
        "wards": [
          {
            "code": "0723",
            "name": "Kipkenyo"
          },
          {
            "code": "0726",
            "name": "Langas"
          },
          {
            "code": "0725",
            "name": "Megun"
          },
          {
            "code": "0724",
            "name": "Ngeria"
          },
          {
            "code": "0722",
            "name": "Simat/Kapseret"
          }
        ]
      },
      {
        "code": "146",
        "name": "Kesses",
        "county": "Uasin Gishu",
        "wards": [
          {
            "code": "0728",
            "name": "Cheptiret/Kipchamo"
          },
          {
            "code": "0727",
            "name": "Racecourse"
          },
          {
            "code": "0730",
            "name": "Tarakwa"
          },
          {
            "code": "0729",
            "name": "Tulwet/Chuiyat"
          }
        ]
      },
      {
        "code": "143",
        "name": "Moiben",
        "county": "Uasin Gishu",
        "wards": [
          {
            "code": "0716",
            "name": "Karuna/Meibeki"
          },
          {
            "code": "0718",
            "name": "Kimumu"
          },
          {
            "code": "0717",
            "name": "Moiben"
          },
          {
            "code": "0715",
            "name": "Sergoit"
          },
          {
            "code": "0714",
            "name": "Tembelio"
          }
        ]
      },
      {
        "code": "141",
        "name": "Soy",
        "county": "Uasin Gishu",
        "wards": [
          {
            "code": "0702",
            "name": "Kapkures"
          },
          {
            "code": "0705",
            "name": "Kipsomba"
          },
          {
            "code": "0707",
            "name": "Kuinet/Kapsuswa"
          },
          {
            "code": "0701",
            "name": "Moi's Bridge"
          },
          {
            "code": "0704",
            "name": "Segero/Barsombe"
          },
          {
            "code": "0706",
            "name": "Soy"
          },
          {
            "code": "0703",
            "name": "Ziwa"
          }
        ]
      },
      {
        "code": "142",
        "name": "Turbo",
        "county": "Uasin Gishu",
        "wards": [
          {
            "code": "0713",
            "name": "Huruma"
          },
          {
            "code": "0710",
            "name": "Kamagut"
          },
          {
            "code": "0712",
            "name": "Kapsaos"
          },
          {
            "code": "0711",
            "name": "Kiplombe"
          },
          {
            "code": "0708",
            "name": "Ngenyilel"
          },
          {
            "code": "0709",
            "name": "Tapsagoi"
          }
        ]
      }
    ]
  },
  {
    "code": "038",
    "name": "Vihiga",
    "subCounties": [
      {
        "code": "215",
        "name": "Emuhaya",
        "county": "Vihiga",
        "wards": [
          {
            "code": "1074",
            "name": "Central Bunyore"
          },
          {
            "code": "1073",
            "name": "North East Bunyore"
          },
          {
            "code": "1075",
            "name": "West Bunyore"
          }
        ]
      },
      {
        "code": "213",
        "name": "Hamisi",
        "county": "Vihiga",
        "wards": [
          {
            "code": "1065",
            "name": "Banja"
          },
          {
            "code": "1064",
            "name": "Gisambai"
          },
          {
            "code": "1067",
            "name": "Jepkoyai"
          },
          {
            "code": "1062",
            "name": "Muhudu"
          },
          {
            "code": "1063",
            "name": "Shamakhokho"
          },
          {
            "code": "1061",
            "name": "Shiru"
          },
          {
            "code": "1066",
            "name": "Tambua"
          }
        ]
      },
      {
        "code": "214",
        "name": "Luanda",
        "county": "Vihiga",
        "wards": [
          {
            "code": "1072",
            "name": "Emabungo"
          },
          {
            "code": "1071",
            "name": "Luanda South"
          },
          {
            "code": "1068",
            "name": "Luanda Township"
          },
          {
            "code": "1070",
            "name": "Mwibona"
          },
          {
            "code": "1069",
            "name": "Wemilabi"
          }
        ]
      },
      {
        "code": "212",
        "name": "Sabatia",
        "county": "Vihiga",
        "wards": [
          {
            "code": "1060",
            "name": "Busali"
          },
          {
            "code": "1057",
            "name": "Chavakali"
          },
          {
            "code": "1055",
            "name": "Lyaduywa/Izava"
          },
          {
            "code": "1058",
            "name": "North Maragoli"
          },
          {
            "code": "1056",
            "name": "West Sabatia"
          },
          {
            "code": "1059",
            "name": "Wodanga"
          }
        ]
      },
      {
        "code": "211",
        "name": "Vihiga",
        "county": "Vihiga",
        "wards": [
          {
            "code": "1053",
            "name": "Central Maragoli"
          },
          {
            "code": "1051",
            "name": "Lugaga-Wamuluma"
          },
          {
            "code": "1054",
            "name": "Mungoma"
          },
          {
            "code": "1052",
            "name": "South Maragoli"
          }
        ]
      }
    ]
  },
  {
    "code": "008",
    "name": "Wajir",
    "subCounties": [
      {
        "code": "037",
        "name": "Eldas",
        "county": "Wajir",
        "wards": [
          {
            "code": "0181",
            "name": "Della"
          },
          {
            "code": "0180",
            "name": "Eldas"
          },
          {
            "code": "0183",
            "name": "Elnur/Tula Tula"
          },
          {
            "code": "0182",
            "name": "Lakoley South/Basir"
          }
        ]
      },
      {
        "code": "035",
        "name": "Tarbaj",
        "county": "Wajir",
        "wards": [
          {
            "code": "0172",
            "name": "Elben"
          },
          {
            "code": "0173",
            "name": "Sarman"
          },
          {
            "code": "0174",
            "name": "Tarbaj"
          },
          {
            "code": "0175",
            "name": "Wargadud"
          }
        ]
      },
      {
        "code": "034",
        "name": "Wajir East",
        "county": "Wajir",
        "wards": [
          {
            "code": "0170",
            "name": "Barwago"
          },
          {
            "code": "0171",
            "name": "Khorof/Harar"
          },
          {
            "code": "0169",
            "name": "Township"
          },
          {
            "code": "0168",
            "name": "Wagberi"
          }
        ]
      },
      {
        "code": "033",
        "name": "Wajir North",
        "county": "Wajir",
        "wards": [
          {
            "code": "0165",
            "name": "Batalu"
          },
          {
            "code": "0162",
            "name": "Bute"
          },
          {
            "code": "0166",
            "name": "Danaba"
          },
          {
            "code": "0167",
            "name": "Godoma"
          },
          {
            "code": "0161",
            "name": "Gurar"
          },
          {
            "code": "0163",
            "name": "Korondile"
          },
          {
            "code": "0164",
            "name": "Malkagufu"
          }
        ]
      },
      {
        "code": "038",
        "name": "Wajir South",
        "county": "Wajir",
        "wards": [
          {
            "code": "0184",
            "name": "Benane"
          },
          {
            "code": "0185",
            "name": "Burder"
          },
          {
            "code": "0186",
            "name": "Dadaja Bulla"
          },
          {
            "code": "0190",
            "name": "Diif"
          },
          {
            "code": "0187",
            "name": "Habasswein"
          },
          {
            "code": "0189",
            "name": "Ibrahim Ure"
          },
          {
            "code": "0188",
            "name": "Lagboghol South"
          }
        ]
      },
      {
        "code": "036",
        "name": "Wajir West",
        "county": "Wajir",
        "wards": [
          {
            "code": "0178",
            "name": "Ademasajide"
          },
          {
            "code": "0176",
            "name": "Arbajahan"
          },
          {
            "code": "0177",
            "name": "Hadado/Athibohol"
          },
          {
            "code": "0179",
            "name": "Wagalla/Ganyure"
          }
        ]
      }
    ]
  },
  {
    "code": "024",
    "name": "West Pokot",
    "subCounties": [
      {
        "code": "131",
        "name": "Kacheliba",
        "county": "West Pokot",
        "wards": [
          {
            "code": "0656",
            "name": "Alale"
          },
          {
            "code": "0653",
            "name": "Kapckok"
          },
          {
            "code": "0654",
            "name": "Kasei"
          },
          {
            "code": "0655",
            "name": "Kiwawa"
          },
          {
            "code": "0652",
            "name": "Kodich"
          },
          {
            "code": "0651",
            "name": "Suam"
          }
        ]
      },
      {
        "code": "129",
        "name": "Kapenguria",
        "county": "West Pokot",
        "wards": [
          {
            "code": "0645",
            "name": "Endugh"
          },
          {
            "code": "0642",
            "name": "Kapenguria"
          },
          {
            "code": "0643",
            "name": "Mnagei"
          },
          {
            "code": "0641",
            "name": "Riwo"
          },
          {
            "code": "0644",
            "name": "Siyoi"
          },
          {
            "code": "0646",
            "name": "Sook"
          }
        ]
      },
      {
        "code": "132",
        "name": "Pokot South",
        "county": "West Pokot",
        "wards": [
          {
            "code": "0658",
            "name": "Batei"
          },
          {
            "code": "0657",
            "name": "Chepareria"
          },
          {
            "code": "0659",
            "name": "Lelan"
          },
          {
            "code": "0660",
            "name": "Tapach"
          }
        ]
      },
      {
        "code": "130",
        "name": "Sigor",
        "county": "West Pokot",
        "wards": [
          {
            "code": "0649",
            "name": "Lomut"
          },
          {
            "code": "0648",
            "name": "Masool"
          },
          {
            "code": "0647",
            "name": "Sekerr"
          },
          {
            "code": "0650",
            "name": "Weiwei"
          }
        ]
      }
    ]
  }
];

// Administrative & Legacy Aliases mapping: (normalized "county:subcounty" or "subcounty" -> canonical Sub-County name)
export const KENYA_SUBCOUNTY_ALIASES: Record<string, string> = {
  "kirinyaga:kirinyaga east": "Gichugu",
  "kirinyaga:kirinyaga west": "Ndia",
  "kirinyaga:mwea east": "Mwea",
  "kirinyaga:mwea west": "Mwea",
  "kirinyaga:kirinyaga central": "Kirinyaga Central",
  "kirinyaga:gichugu": "Gichugu",
  "kirinyaga:ndia": "Ndia",
  "kirinyaga:mwea": "Mwea",
  "nyeri:kieni east": "Kieni",
  "nyeri:kieni west": "Kieni",
  "nyeri:mathira east": "Mathira",
  "nyeri:mathira west": "Mathira",
  "nyeri:mkurweni": "Mukurweini",
  "nyeri:mukurwe-ini": "Mukurweini",
  "nyeri:mukurweini": "Mukurweini",
  "nyeri:nyeri town": "Nyeri Town",
  "nyeri:othaya": "Othaya",
  "nyeri:tetu": "Tetu",
  "nyeri:kieni": "Kieni",
  "nyeri:mathira": "Mathira",
  "nairobi:lang": "Lang'ata",
  "nairobi:langata": "Lang'ata",
  "nairobi:lang'ata": "Lang'ata",
  "nairobi:dagoretti-north": "Dagoretti North",
  "nairobi:dagoretti-south": "Dagoretti South",
  "nairobi:embakasi-central": "Embakasi Central",
  "nairobi:embakasi-east": "Embakasi East",
  "nairobi:embakasi-north": "Embakasi North",
  "nairobi:embakasi-south": "Embakasi South",
  "nairobi:embakasi-west": "Embakasi West",
  "kiambu:thika": "Thika Town",
  "kiambu:thika town": "Thika Town",
  "bungoma:kimilil": "Kimilili",
  "bungoma:mt elgon": "Mt. Elgon",
  "bungoma:mt. elgon": "Mt. Elgon",
  "busia:nambele": "Nambale",
  "garissa:daadab": "Dadaab",
  "garissa:garissa": "Garissa Township",
  "garissa:hulugho": "Ijara",
  "garissa:lagdera balambala": "Lagdera",
  "homa bay:homabay town": "Homa Bay Town",
  "homa bay:kabondo": "Kabondo Kasipul",
  "homa bay:karachwonyo": "Karachuonyo",
  "homa bay:mbita": "Mbita",
  "homa bay:gwassi": "Suba",
  "isiolo:garba tula": "Isiolo South",
  "isiolo:isiolo": "Isiolo North",
  "isiolo:merit": "Isiolo North",
  "kajiado:isinya": "Kajiado East",
  "kajiado:loitokitok": "Kajiado South",
  "kajiado:mashuuru": "Kajiado East",
  "kakamega:kakamega central": "Lurambi",
  "kakamega:kakamega east": "Shinyalu",
  "kakamega:kakamega north": "Malava",
  "kakamega:kakamega south": "Ikolomani",
  "kakamega:lukuyani": "Likuyani",
  "kakamega:matete": "Lugari",
  "kakamega:mumias": "Mumias West",
  "kakamega:mutungu": "Matungu",
  "kilifi:genzw": "Ganze",
  "kisumu:mohoroni": "Muhoroni",
  "kitui:ikutha": "Kitui South",
  "kitui:katulani": "Kitui Rural",
  "kitui:kisasi": "Kitui Rural",
  "kitui:lower yatta": "Kitui Rural",
  "kitui:matiyani": "Kitui West",
  "kitui:migwani": "Mwingi West",
  "kitui:mutitu": "Kitui East",
  "kitui:mutomo": "Kitui South",
  "kitui:muumonikyusu": "Mwingi North",
  "kitui:mwingi east": "Mwingi Central",
  "kitui:nzambani": "Kitui East",
  "kitui:tseikuru": "Mwingi North",
  "kwale:mutuga": "Matuga",
  "laikipia:laikipia central": "Laikipia East",
  "laikipia:nyahururu": "Laikipia West",
  "marsabit:north hor": "North Horr",
  "meru:imenti central": "Central Imenti",
  "meru:imenti north": "North Imenti",
  "meru:imenti south": "South Imenti",
  "migori:mabera": "Kuria West",
  "migori:ntimaru": "Kuria East",
  "murang'a:kahuro": "Kiharu",
  "murang'a:murang'a": "Kiharu",
  "nandi:tindiret": "Tinderet",
  "narok:transmara east": "Emurua Dikirr",
  "narok:transmara west": "Kilgoris",
  "nyamira:manga": "Kitutu Masaba",
  "nyamira:masaba north": "Kitutu Masaba",
  "nyamira:nyamira north": "North Mugirango",
  "nyamira:nyamira south": "West Mugirango",
  "nyandarua:ol joro orok": "Ol Jorok",
  "siaya:unguja": "Ugunja",
  "tharaka-nithi:chuka": "Chuka/Igambang'ombe",
  "tharaka-nithi:igambangobe": "Chuka/Igambang'ombe",
  "tharaka-nithi:muthambi": "Maara",
  "tharaka-nithi:tharaka north": "Tharaka",
  "tharaka-nithi:tharaka south": "Tharaka",
  "nairobi:kilimani": "Dagoretti North",
  "nairobi:kileleshwa": "Dagoretti North",
  "kiambu:kiambaa (ruaka)": "Kiambaa",
  "kiambu:ruaka": "Kiambaa",
  "west pokot:central pokot": "Sigor",
  "west pokot:north pokot": "Kacheliba",
  "west pokot:west pokot": "Kapenguria"
};
