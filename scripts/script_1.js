
const CONFIG = {
  APP_VERSION: "v135",
  UPDATE_CHECK_MS: 1000 * 60,
  // 기존 앱에서 사용하던 Apps Script 배포 URL을 기본으로 넣어둠.
  // 같은 Apps Script 프로젝트에 Code.gs를 교체하고 '배포 관리 > 새 버전'만 하면 이 URL 그대로 사용 가능.
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwtnE_Bwm4YwwBHdg-38aelzvlnR0ryZKo9zwLwVjkiehVFdaboxDBFdS8NsAg3ZeGhZQ/exec",
  CACHE_KEY: "costco_item_operation_hub_cache",
  LEGACY_CACHE_KEYS: [
    ...Array.from({length: 39}, (_, i)=>`costco_item_operation_hub_v${49+i}_cache`),
    ...Array.from({length: 39}, (_, i)=>`costco_item_operation_hub_cache_v${49+i}`)
  ],
  CACHE_MAX_MS: 1000 * 60 * 60 * 12,
  SPEC_IMAGE_BASE_PATH: "./images/",
  PROCESS_IMAGE_BASE_PATH: "./images/process/",
  PROCESS_IMAGE_RAW_BASE: "https://raw.githubusercontent.com/kimyoungun90-beep/samsung-item-hub/main/images/process/",
  SPEC_IMAGE_RAW_BASE: "https://raw.githubusercontent.com/kimyoungun90-beep/samsung-item-hub/main/images/",
  SPEC_IMAGE_GITHUB_API: "https://api.github.com/repos/kimyoungun90-beep/samsung-item-hub/contents/images?ref=main",
  SPEC_IMAGE_MAX_COUNT: 10,
  SPEC_IMAGE_EXTENSIONS: ["png","jpg","jpeg","webp"],
  SPEC_IMAGE_CACHE_BUST: "v135"
};

const DETAIL_TABS = [
  { key:"spec", label:"스펙" },
  { key:"feature", label:"기능" },
  { key:"wallModel", label:"벽걸이 모델명/설치비" },
  { key:"cost", label:"이전설치/철거 비용" }
];

const SPEC_CATEGORY_IMAGES = [
  { key:"tv", label:"TV", icon:"TV", desc:"화면, 영상, 사운드, 스마트 기능을 한눈에 확인", prefix:"spec_tv" },
  { key:"fridge", label:"냉장고", icon:"REF", desc:"용량, 냉각, AI, 편의 기능을 비교 확인", prefix:"spec_fridge" },
  { key:"washer", label:"세탁기/건조기", icon:"W/D", desc:"세탁, 건조, AI, 에너지 기능을 비교 확인", prefix:"spec_washer" },
  { key:"aircon", label:"에어컨", icon:"A/C", desc:"냉방, 무풍, 청정, 제습, 스마트 기능을 비교 확인", prefix:"spec_aircon" },
  { key:"kimchi", label:"김치냉장고", icon:"KIM", desc:"보관, 숙성, 냉각, 편의 기능을 비교 확인", prefix:"spec_kimchi" }
];

const ITEM_CATEGORY_FILTERS = [
  { key:"전체", label:"전체" },
  { key:"TV/모니터", label:"TV/모니터" },
  { key:"에어컨", label:"에어컨" },
  { key:"냉장고", label:"냉장고" },
  { key:"세탁기/건조기", label:"세탁기/건조기" },
  { key:"김치냉장고", label:"김치냉장고" },
  { key:"소형가전", label:"소형가전" }
];


const SPEC_TERM_GUIDES = {
  tv: [
    { term:"해상도", desc:"화면을 이루는 픽셀 수입니다. 4K는 3,840×2,160 수준으로, 숫자가 클수록 더 촘촘하고 선명하게 표현됩니다." },
    { term:"주사율", desc:"1초에 화면을 몇 번 새로 그리는지 나타냅니다. 60Hz보다 120Hz가 스포츠·게임처럼 빠른 화면에서 더 부드럽습니다." },
    { term:"DLG", desc:"게임 화면을 더 부드럽게 보이도록 프레임을 보정하는 기능입니다. 실제 패널 주사율과 체감 부드러움은 모델별로 다를 수 있습니다." },
    { term:"화질엔진", desc:"입력 영상을 분석해 색감, 선명도, 명암 등을 보정하는 TV의 영상 처리 프로세서입니다." },
    { term:"HDR", desc:"밝은 곳은 더 밝게, 어두운 곳은 더 깊게 표현해 명암 범위를 넓히는 영상 기술입니다." },
    { term:"HDR 10+", desc:"장면별 밝기 정보를 활용해 HDR 표현을 더 세밀하게 조정하는 규격입니다. 콘텐츠가 지원해야 효과를 볼 수 있습니다." },
    { term:"명암비", desc:"가장 밝은 화면과 가장 어두운 화면의 차이입니다. 명암비가 높을수록 깊이감과 입체감이 좋아 보입니다." },
    { term:"디밍 기술", desc:"화면 영역별로 밝기를 조절해 검은색 표현과 대비감을 개선하는 기능입니다." },
    { term:"명암비 강화 기술", desc:"영상의 밝고 어두운 부분을 분석해 더 또렷하게 보이도록 대비를 보정하는 기능입니다." },
    { term:"모션 성능", desc:"빠르게 움직이는 장면의 잔상이나 끊김을 줄여주는 성능입니다. 스포츠·액션·게임에서 체감이 큽니다." },
    { term:"AI 화질 최적화/모드", desc:"시청 환경이나 콘텐츠를 분석해 밝기, 색감, 선명도 등을 자동으로 조정하는 기능입니다." },
    { term:"AI 화질 업스케일링", desc:"저해상도 영상을 4K 수준에 가깝게 보이도록 선명도와 디테일을 보정하는 기능입니다." },
    { term:"AI 모션 강화", desc:"움직임이 많은 장면을 분석해 더 자연스럽고 선명하게 보이도록 보정하는 기능입니다." },
    { term:"HDR 밝기 최적화", desc:"주변 밝기나 장면 정보를 반영해 HDR 화면의 밝기 표현을 자동으로 맞추는 기능입니다." },
    { term:"컬러 부스터", desc:"색 표현을 보정해 색감을 더 풍부하고 선명하게 보여주는 기능입니다." },
    { term:"필름메이커 모드(FMM)", desc:"영화 제작자가 의도한 색감과 프레임 느낌에 가깝게 보이도록 영상 보정을 줄이는 모드입니다." },
    { term:"돌비 애트모스", desc:"소리를 위·주변 공간까지 확장해 입체적으로 들리게 하는 사운드 기술입니다. 콘텐츠 지원 여부에 따라 차이가 납니다." },
    { term:"무빙 사운드(OTS)", desc:"화면 속 움직임에 맞춰 소리 위치가 따라가는 것처럼 들리게 하는 삼성 사운드 기능입니다." }
  ],
  common: [
    { term:"있음/지원", desc:"해당 기능을 사용할 수 있다는 뜻입니다. 실제 사용 조건은 콘텐츠, 연결 기기, 앱 지원 여부에 따라 달라질 수 있습니다." },
    { term:"없음/미지원", desc:"해당 모델에서 해당 기능을 기본 지원하지 않는다는 뜻입니다." },
    { term:"N/A", desc:"해당 항목이 제품 특성상 적용 대상이 아니거나 공식 비교값이 없는 경우입니다." }
  ]
};

const FALLBACK_MAP_DATA = {"stores":[{"name":"양재점","address":"서울특별시 서초구 양재대로 159","tc":"남서울TC","x":44.0,"y":28.0,"phone":"1899-9900"},{"name":"양평점","address":"서울특별시 영등포구 선유로 156","tc":"서서울TC","x":38.0,"y":25.0,"phone":"1899-9900"},{"name":"상봉점","address":"서울특별시 중랑구 망우로 336","tc":"동서울TC","x":48.0,"y":24.0,"phone":"1899-9900"},{"name":"고척점","address":"서울특별시 구로구 경인로43길 49","tc":"인천TC","x":39.0,"y":27.0,"phone":"1899-9900"},{"name":"광명점","address":"경기도 광명시 일직로 40","tc":"인천TC","x":38.0,"y":30.0,"phone":"1899-9900"},{"name":"하남점","address":"경기도 하남시 미사강변한강로 209","tc":"동서울TC","x":50.0,"y":27.0,"phone":"1899-9900"},{"name":"의정부점","address":"경기도 의정부시 용민로 489","tc":"동서울TC","x":45.0,"y":18.0,"phone":"1899-9900"},{"name":"공세점","address":"경기도 용인시 기흥구 탑실로 38","tc":"평택TC","x":47.0,"y":38.0,"phone":"1899-9900"},{"name":"일산점","address":"경기도 고양시 일산동구 장백로 25","tc":"서서울TC","x":35.0,"y":21.0,"phone":"1899-9900"},{"name":"송도점","address":"인천광역시 연수구 컨벤시아대로 230","tc":"인천TC","x":31.0,"y":30.0,"phone":"1899-9900"},{"name":"청라점","address":"인천광역시 서구 첨단서로 188","tc":"인천TC","x":32.0,"y":25.0,"phone":"1899-9900"},{"name":"평택점","address":"경기도 평택시 경기대로 975","tc":"평택TC","x":46.0,"y":43.0,"phone":"1899-9900"},{"name":"천안점","address":"충청남도 천안시 서북구 3공단6로 77","tc":"아산TC","x":47.0,"y":48.0,"phone":"1899-9900"},{"name":"세종점","address":"세종특별자치시 종합운동장1로 14","tc":"세종TC","x":49.0,"y":50.0,"phone":"1899-9900"},{"name":"대전점","address":"대전광역시 중구 오류로 41","tc":"세종TC","x":50.0,"y":53.0,"phone":"1899-9900"},{"name":"대구점","address":"대구광역시 북구 검단로 97","tc":"대구TC","x":67.0,"y":64.0,"phone":"1899-9900"},{"name":"혁신점","address":"대구광역시 동구 첨단로 10","tc":"대구TC","x":70.0,"y":65.0,"phone":"1899-9900"},{"name":"울산점","address":"울산광역시 북구 진장유통로 78-12","tc":"울산TC","x":79.0,"y":74.0,"phone":"1899-9900"},{"name":"부산점","address":"부산광역시 수영구 구락로 137","tc":"양산TC","x":73.0,"y":83.0,"phone":"1899-9900"},{"name":"김해점","address":"경상남도 김해시 선천남로 16","tc":"양산TC","x":70.0,"y":80.0,"phone":"1899-9900"}],"logistics":[{"name":"서서울TC","address":"경기 고양시 일산서구 덕이로 256","phone":"1577-3913","x":34.0,"y":24.0,"kind":"TC"},{"name":"동서울TC","address":"경기도 남양주시 진접읍 양진로 980","phone":"1577-3914","x":49.0,"y":22.0,"kind":"TC"},{"name":"인천TC","address":"인천광역시 중구 항동7가 56","phone":"1577-3921","x":30.0,"y":28.0,"kind":"TC"},{"name":"평택TC","address":"경기 평택시 청북읍 어연리 687","phone":"1577-3922","x":46.0,"y":42.0,"kind":"TC"},{"name":"원주TC","address":"원주시 문막읍 원문로 2298-1","phone":"1577-3931","x":58.0,"y":37.0,"kind":"TC"},{"name":"강릉TC","address":"강원 강릉시 입암동 694-1","phone":"1577-3932","x":75.0,"y":34.0,"kind":"TC"},{"name":"남서울TC","address":"경기도 광주시 초월읍 무갑리 912-0","phone":"1899-9300","x":45.0,"y":29.0,"kind":"TC"},{"name":"대구TC","address":"대구 달서구 호산동 717번지","phone":"1577-3951","x":68.0,"y":64.0,"kind":"TC"},{"name":"양산TC","address":"경남 양산시 물금읍 증산리 936-4번지 한국복합물류단지 E동","phone":"1577-3961","x":72.0,"y":80.0,"kind":"TC"},{"name":"포항TC","address":"경북 포항시 기계면 새마을로 1296","phone":"1577-3953","x":80.0,"y":62.0,"kind":"TC"},{"name":"안동TC","address":"경북 안동시 풍산읍 유통단지길 32번지","phone":"1577-3954","x":70.0,"y":55.0,"kind":"TC"},{"name":"창원TC","address":"경남 함안군 칠원면 용산리 901-4번지","phone":"1577-3966","x":65.0,"y":79.0,"kind":"TC"},{"name":"울산TC","address":"울산광역시 울주군 삼남면 신안길 35-13","phone":"1577-3967","x":79.0,"y":74.0,"kind":"TC"},{"name":"사천TC","address":"사천시 축동면 탑리 910-3번지","phone":"1577-3960","x":58.0,"y":82.0,"kind":"TC"},{"name":"제주DC","address":"제주 제주시 화북일동 2140-1","phone":"1577-3971","x":42.0,"y":96.0,"kind":"TC"},{"name":"광주TC","address":"광주 북구 오룡동 1119번지 삼성제3공장","phone":"1577-3945","x":42.0,"y":77.0,"kind":"TC"},{"name":"세종TC","address":"세종시 부강면 연청로 745-46번지 중부복합물류터미널 B동","phone":"1577-3941","x":49.0,"y":51.0,"kind":"TC"},{"name":"아산TC","address":"충청남도 아산시 신창면 남성길 239","phone":"1577-3942","x":44.0,"y":47.0,"kind":"TC"},{"name":"익산TC","address":"전북 익산시 금마면 동고도리 1038-3","phone":"1577-3944","x":42.0,"y":65.0,"kind":"TC"},{"name":"순천TC","address":"전라남도 순천시 해룡면 여순로 1147","phone":"1577-3946","x":50.0,"y":82.0,"kind":"TC"},{"name":"목포TC","address":"전남 무안군 삼향읍 왕산리 175번지","phone":"1577-3947","x":34,"y":84,"kind":"TC"}],"coverage":[{"tc":"서서울TC","province":"서울","area":"강서구","note":""},{"tc":"서서울TC","province":"서울","area":"마포구","note":""},{"tc":"서서울TC","province":"서울","area":"용산구","note":""},{"tc":"서서울TC","province":"서울","area":"서대문구","note":""},{"tc":"서서울TC","province":"서울","area":"은평구","note":""},{"tc":"서서울TC","province":"서울","area":"종로구","note":""},{"tc":"서서울TC","province":"서울","area":"중구","note":""},{"tc":"서서울TC","province":"서울","area":"양천구","note":""},{"tc":"서서울TC","province":"서울","area":"영등포구","note":""},{"tc":"서서울TC","province":"서울","area":"동작구","note":""},{"tc":"서서울TC","province":"서울","area":"관악구","note":""},{"tc":"서서울TC","province":"경기","area":"고양시","note":""},{"tc":"서서울TC","province":"경기","area":"김포시","note":""},{"tc":"서서울TC","province":"경기","area":"파주시","note":""},{"tc":"서서울TC","province":"인천","area":"강화군","note":""},{"tc":"동서울TC","province":"서울","area":"강동구","note":""},{"tc":"동서울TC","province":"서울","area":"광진구","note":""},{"tc":"동서울TC","province":"서울","area":"노원구","note":""},{"tc":"동서울TC","province":"서울","area":"성동구","note":""},{"tc":"동서울TC","province":"서울","area":"중랑구","note":""},{"tc":"동서울TC","province":"서울","area":"동대문구","note":""},{"tc":"동서울TC","province":"서울","area":"강북구","note":""},{"tc":"동서울TC","province":"서울","area":"성북구","note":""},{"tc":"동서울TC","province":"서울","area":"도봉구","note":""},{"tc":"동서울TC","province":"경기","area":"하남시","note":""},{"tc":"동서울TC","province":"경기","area":"의정부시","note":""},{"tc":"동서울TC","province":"경기","area":"구리시","note":""},{"tc":"동서울TC","province":"경기","area":"남양주시","note":""},{"tc":"동서울TC","province":"경기","area":"동두천시","note":""},{"tc":"동서울TC","province":"경기","area":"포천시","note":""},{"tc":"동서울TC","province":"경기","area":"연천군","note":""},{"tc":"동서울TC","province":"경기","area":"양주시","note":""},{"tc":"동서울TC","province":"강원","area":"철원군","note":""},{"tc":"인천TC","province":"서울","area":"구로구","note":""},{"tc":"인천TC","province":"서울","area":"금천구","note":""},{"tc":"인천TC","province":"경기","area":"광명시","note":""},{"tc":"인천TC","province":"경기","area":"부천시","note":""},{"tc":"인천TC","province":"경기","area":"시흥시","note":""},{"tc":"인천TC","province":"경기","area":"안산시","note":""},{"tc":"인천TC","province":"인천","area":"중구","note":"강화군 제외"},{"tc":"인천TC","province":"인천","area":"동구","note":"강화군 제외"},{"tc":"인천TC","province":"인천","area":"미추홀구","note":"강화군 제외"},{"tc":"인천TC","province":"인천","area":"연수구","note":"강화군 제외"},{"tc":"인천TC","province":"인천","area":"남동구","note":"강화군 제외"},{"tc":"인천TC","province":"인천","area":"부평구","note":"강화군 제외"},{"tc":"인천TC","province":"인천","area":"계양구","note":"강화군 제외"},{"tc":"인천TC","province":"인천","area":"서구","note":"강화군 제외"},{"tc":"평택TC","province":"경기","area":"안양시","note":""},{"tc":"평택TC","province":"경기","area":"의왕시","note":""},{"tc":"평택TC","province":"경기","area":"군포시","note":""},{"tc":"평택TC","province":"경기","area":"과천시","note":""},{"tc":"평택TC","province":"경기","area":"오산시","note":""},{"tc":"평택TC","province":"경기","area":"화성시","note":""},{"tc":"평택TC","province":"경기","area":"수원시","note":""},{"tc":"평택TC","province":"경기","area":"용인시","note":""},{"tc":"평택TC","province":"경기","area":"평택시","note":""},{"tc":"평택TC","province":"경기","area":"안성시","note":""},{"tc":"원주TC","province":"강원","area":"원주시","note":""},{"tc":"원주TC","province":"강원","area":"영월군","note":""},{"tc":"원주TC","province":"강원","area":"인제군","note":""},{"tc":"원주TC","province":"강원","area":"횡성군","note":""},{"tc":"원주TC","province":"강원","area":"춘천시","note":""},{"tc":"원주TC","province":"강원","area":"화천군","note":""},{"tc":"원주TC","province":"강원","area":"양구군","note":""},{"tc":"원주TC","province":"강원","area":"홍천군","note":""},{"tc":"원주TC","province":"강원","area":"평창군","note":""},{"tc":"원주TC","province":"경기","area":"이천시","note":""},{"tc":"원주TC","province":"경기","area":"양평군","note":""},{"tc":"원주TC","province":"경기","area":"여주시","note":""},{"tc":"원주TC","province":"경기","area":"가평군","note":""},{"tc":"원주TC","province":"충북","area":"충주시","note":""},{"tc":"원주TC","province":"충북","area":"제천시","note":""},{"tc":"원주TC","province":"충북","area":"괴산군","note":""},{"tc":"원주TC","province":"충북","area":"단양군","note":""},{"tc":"원주TC","province":"충북","area":"음성군","note":""},{"tc":"강릉TC","province":"강원","area":"강릉시","note":"광원리·장촌리·명개리·자운리·대관령면·진부면·속사리·이목정리·노동리 포함"},{"tc":"강릉TC","province":"강원","area":"동해시","note":"광원리·장촌리·명개리·자운리·대관령면·진부면·속사리·이목정리·노동리 포함"},{"tc":"강릉TC","province":"강원","area":"삼척시","note":"광원리·장촌리·명개리·자운리·대관령면·진부면·속사리·이목정리·노동리 포함"},{"tc":"강릉TC","province":"강원","area":"속초시","note":"광원리·장촌리·명개리·자운리·대관령면·진부면·속사리·이목정리·노동리 포함"},{"tc":"강릉TC","province":"강원","area":"태백시","note":"광원리·장촌리·명개리·자운리·대관령면·진부면·속사리·이목정리·노동리 포함"},{"tc":"강릉TC","province":"강원","area":"고성군","note":"광원리·장촌리·명개리·자운리·대관령면·진부면·속사리·이목정리·노동리 포함"},{"tc":"강릉TC","province":"강원","area":"양양군","note":"광원리·장촌리·명개리·자운리·대관령면·진부면·속사리·이목정리·노동리 포함"},{"tc":"강릉TC","province":"강원","area":"정선군","note":"광원리·장촌리·명개리·자운리·대관령면·진부면·속사리·이목정리·노동리 포함"},{"tc":"남서울TC","province":"서울","area":"송파구","note":""},{"tc":"남서울TC","province":"서울","area":"강남구","note":""},{"tc":"남서울TC","province":"서울","area":"서초구","note":""},{"tc":"남서울TC","province":"경기","area":"성남시","note":""},{"tc":"남서울TC","province":"경기","area":"광주시","note":""},{"tc":"대구TC","province":"대구","area":"대구광역시","note":""},{"tc":"대구TC","province":"경북","area":"경산시","note":""},{"tc":"대구TC","province":"경북","area":"김천시","note":""},{"tc":"대구TC","province":"경북","area":"구미시","note":""},{"tc":"대구TC","province":"경북","area":"칠곡군","note":""},{"tc":"대구TC","province":"경북","area":"고령군","note":""},{"tc":"대구TC","province":"경북","area":"성주군","note":""},{"tc":"대구TC","province":"경북","area":"청도군","note":""},{"tc":"대구TC","province":"경북","area":"군위군","note":""},{"tc":"대구TC","province":"경남","area":"거창군","note":""},{"tc":"양산TC","province":"부산","area":"부산광역시","note":""},{"tc":"양산TC","province":"경남","area":"양산시","note":""},{"tc":"양산TC","province":"경남","area":"김해시","note":""},{"tc":"양산TC","province":"경남","area":"밀양시","note":""},{"tc":"포항TC","province":"경북","area":"포항시","note":""},{"tc":"포항TC","province":"경북","area":"경주시","note":""},{"tc":"포항TC","province":"경북","area":"영덕군","note":""},{"tc":"포항TC","province":"경북","area":"울진군","note":""},{"tc":"포항TC","province":"경북","area":"영천시","note":""},{"tc":"포항TC","province":"경북","area":"울릉군","note":""},{"tc":"안동TC","province":"경북","area":"안동시","note":""},{"tc":"안동TC","province":"경북","area":"상주시","note":""},{"tc":"안동TC","province":"경북","area":"문경시","note":""},{"tc":"안동TC","province":"경북","area":"영주시","note":""},{"tc":"안동TC","province":"경북","area":"의성군","note":""},{"tc":"안동TC","province":"경북","area":"영양군","note":""},{"tc":"안동TC","province":"경북","area":"청송군","note":""},{"tc":"안동TC","province":"경북","area":"봉화군","note":""},{"tc":"안동TC","province":"경북","area":"예천군","note":""},{"tc":"창원TC","province":"경남","area":"창원시","note":""},{"tc":"창원TC","province":"경남","area":"의령군","note":""},{"tc":"창원TC","province":"경남","area":"함안군","note":""},{"tc":"창원TC","province":"경남","area":"합천군","note":""},{"tc":"창원TC","province":"경남","area":"창녕군","note":""},{"tc":"울산TC","province":"울산","area":"울산광역시","note":""},{"tc":"사천TC","province":"경남","area":"진주시","note":""},{"tc":"사천TC","province":"경남","area":"통영시","note":""},{"tc":"사천TC","province":"경남","area":"사천시","note":""},{"tc":"사천TC","province":"경남","area":"거제시","note":""},{"tc":"사천TC","province":"경남","area":"고성군","note":""},{"tc":"사천TC","province":"경남","area":"남해군","note":""},{"tc":"사천TC","province":"경남","area":"하동군","note":""},{"tc":"사천TC","province":"경남","area":"산청군","note":""},{"tc":"사천TC","province":"경남","area":"함양군","note":""},{"tc":"제주DC","province":"제주","area":"제주특별자치도","note":""},{"tc":"광주TC","province":"광주","area":"광주광역시","note":""},{"tc":"광주TC","province":"전남","area":"나주시","note":"학교면·함평읍·엄다면 제외"},{"tc":"광주TC","province":"전남","area":"화순군","note":"학교면·함평읍·엄다면 제외"},{"tc":"광주TC","province":"전남","area":"담양군","note":"학교면·함평읍·엄다면 제외"},{"tc":"광주TC","province":"전남","area":"장성군","note":"학교면·함평읍·엄다면 제외"},{"tc":"광주TC","province":"전남","area":"곡성군","note":"학교면·함평읍·엄다면 제외"},{"tc":"광주TC","province":"전남","area":"영광군","note":"학교면·함평읍·엄다면 제외"},{"tc":"광주TC","province":"전남","area":"함평군","note":"학교면·함평읍·엄다면 제외"},{"tc":"광주TC","province":"전북","area":"고창군","note":""},{"tc":"광주TC","province":"전북","area":"순창군","note":""},{"tc":"광주TC","province":"전북","area":"남원시","note":""},{"tc":"광주TC","province":"전북","area":"정읍시","note":""},{"tc":"세종TC","province":"대전","area":"대전광역시","note":""},{"tc":"세종TC","province":"세종","area":"세종특별자치시","note":""},{"tc":"세종TC","province":"충북","area":"청주시","note":""},{"tc":"세종TC","province":"충북","area":"보은군","note":""},{"tc":"세종TC","province":"충북","area":"영동군","note":""},{"tc":"세종TC","province":"충북","area":"옥천군","note":""},{"tc":"세종TC","province":"충북","area":"진천군","note":""},{"tc":"세종TC","province":"충북","area":"증평군","note":""},{"tc":"세종TC","province":"충남","area":"공주시","note":""},{"tc":"세종TC","province":"충남","area":"계룡시","note":""},{"tc":"세종TC","province":"충남","area":"금산군","note":""},{"tc":"세종TC","province":"충남","area":"청양군","note":""},{"tc":"세종TC","province":"전북","area":"무주군","note":""},{"tc":"아산TC","province":"충남","area":"아산시","note":""},{"tc":"아산TC","province":"충남","area":"천안시","note":""},{"tc":"아산TC","province":"충남","area":"서산시","note":""},{"tc":"아산TC","province":"충남","area":"보령시","note":""},{"tc":"아산TC","province":"충남","area":"당진군","note":""},{"tc":"아산TC","province":"충남","area":"예산군","note":""},{"tc":"아산TC","province":"충남","area":"태안군","note":""},{"tc":"아산TC","province":"충남","area":"홍성군","note":""},{"tc":"익산TC","province":"전북","area":"전주시","note":""},{"tc":"익산TC","province":"전북","area":"김제시","note":""},{"tc":"익산TC","province":"전북","area":"군산시","note":""},{"tc":"익산TC","province":"전북","area":"익산시","note":""},{"tc":"익산TC","province":"전북","area":"임실군","note":""},{"tc":"익산TC","province":"전북","area":"장수군","note":""},{"tc":"익산TC","province":"전북","area":"진안군","note":""},{"tc":"익산TC","province":"전북","area":"부안군","note":""},{"tc":"익산TC","province":"전북","area":"완주군","note":""},{"tc":"익산TC","province":"충남","area":"서천군","note":""},{"tc":"익산TC","province":"충남","area":"논산시","note":""},{"tc":"익산TC","province":"충남","area":"부여군","note":""},{"tc":"순천TC","province":"전남","area":"순천시","note":""},{"tc":"순천TC","province":"전남","area":"광양시","note":""},{"tc":"순천TC","province":"전남","area":"여수시","note":""},{"tc":"순천TC","province":"전남","area":"구례군","note":""},{"tc":"순천TC","province":"전남","area":"고흥군","note":""},{"tc":"순천TC","province":"전남","area":"보성군","note":""},{"tc":"목포TC","province":"전남","area":"목포시","note":"함평읍·학교면·엄다면"},{"tc":"목포TC","province":"전남","area":"무안군","note":"함평읍·학교면·엄다면"},{"tc":"목포TC","province":"전남","area":"해남군","note":"함평읍·학교면·엄다면"},{"tc":"목포TC","province":"전남","area":"진도군","note":"함평읍·학교면·엄다면"},{"tc":"목포TC","province":"전남","area":"강진군","note":"함평읍·학교면·엄다면"},{"tc":"목포TC","province":"전남","area":"영암군","note":"함평읍·학교면·엄다면"},{"tc":"목포TC","province":"전남","area":"신안군","note":"함평읍·학교면·엄다면"},{"tc":"목포TC","province":"전남","area":"장흥군","note":"함평읍·학교면·엄다면"},{"tc":"목포TC","province":"전남","area":"완도군","note":"함평읍·학교면·엄다면"},{"tc":"목포TC","province":"전남","area":"함평군","note":"함평읍·학교면·엄다면"}]};
let DB = { items:[], departments:[], mapData:{stores:[],logistics:[],coverage:[]}, processes:[], processRecommendations:[], specCompare:[], notices:[], displayCheckItems:[], homeSettings:{}, updatedAt:"" };
const HOME_RECENT_KEY = "costco_item_hub_recent_v76";
const ITEM_FAVORITES_KEY = "costco_item_hub_item_favorites_v1";
const CONTENT_FAVORITES_KEY = "costco_item_hub_content_favorites_v1";
const AIRCON_SPEC_SNAPSHOT_KEY = "costco_item_hub_aircon_spec_snapshot_v1";
const APP_RESUME_HOME_MS = 1000 * 60;
const UPDATE_SEEN_KEY = "costco_item_hub_update_seen_v113";
const DB_UPDATE_VERSION_KEY = "costco_item_hub_db_update_version";
const VIEW_LOG_DEDUPE_MS = 1500;
let updateSignalTimer = 0;
let bootstrapLoading = false;
let manualRefreshPromise = null;
let manualRefreshController = null;
let pendingManualRefreshAfterSuccess = null;
let bootstrapReady = false;
let lastPublishedDbErrorCode = "";
let selectedNotice = null;
let appHiddenAt = 0;
let lastVersionCheckAt = 0;
const recentViewLogTimes = new Map();
let currentPage = "home";
let appBackStack = [];
const APP_ROUTE_PAGES = new Set(["home","favorites","notice","noticeDetail","item","itemDetail","specTable","inquiry","dept","process","displayCheck"]);
let recentExpanded = false;
let itemMap = new Map();
let selectedItemCategoryFilter = "전체";
let selectedItem = null;
let selectedTab = "";
let quickListCurrentPage = 1;
const QUICK_LIST_PAGE_SIZE = 5;
let itemDetailTab = "spec";
let selectedAirconSpecPart = "스탠드";
let selectedPhotoIndex = 0;
let currentImageUrls = [];
let modalImageUrls = [];
let modalImageIndex = 0;
let modalCaptionBase = "이미지 확대 보기";
let modalHistoryPushed = false;
let specHistoryPushed = false;
let specViewerUrls = [];
let specViewerIndex = 0;
let specViewerCaption = "상세 스펙";
let specTapStartX = 0;
let specTapStartY = 0;
let specTapMoved = false;
let deptFilter = "업무지원실";
let deptInteracted = false;
let mapMode = "all";
let mapSelectedStore = "";
let mapSelectedTc = "";
let mapMetroOpen = false;
let mapZoom = 1;
let processFilter = "전체";
let processSuggestions = [];
let processSuggestionOpen = false;
let processRecommendationLoadedAt = 0;
let processRecommendationLoading = false;
let processPendingOpenIndex = null;
const processSearchLogTimes = new Map();
let processViewMode = "home";
let processDetailRow = null;
let processDetailReturn = { mode:"home", query:"", filter:"전체" };
let processHistoryView = "home";
let compareFilter = "전체";
let displayCheckState = new Map();
let displayCheckPendingItemCode = "";
let displayCheckCaptureSequence = 0;
const displayCheckUploadResolvers = new Map();
let displayCheckStatusLoadedKey = "";
let displayCheckItemsLoading = null;
let displayCheckItemsLoadedAt = 0;
let currentSpecCategoryKey = "";
let specCategoryUrlCache = new Map();
let featureImageUrlCache = new Map();
let specPrefetchStarted = false;

const $ = (id)=>document.getElementById(id);
const els = {
  status:$("status"), syncText:$("syncText"), topRefreshBtn:$("topRefreshBtn"), floatRefreshBtn:$("floatRefreshBtn"), mainNav:$("mainNav"), globalBackTop:$("globalBackTop"), globalBackBottom:$("globalBackBottom"), globalRefreshTop:$("globalRefreshTop"), globalHomeBottom:$("globalHomeBottom"), itemPageRefreshBtn:$("itemPageRefreshBtn"),
  navItem:$("navItem"), navSpecTable:$("navSpecTable"), navInquiry:$("navInquiry"), navDept:$("navDept"), navProcess:$("navProcess"),
  pageHome:$("pageHome"), pageFavorites:$("pageFavorites"), pageNotice:$("pageNotice"), pageNoticeDetail:$("pageNoticeDetail"), pageItem:$("pageItem"), pageItemDetail:$("pageItemDetail"), pageSpecTable:$("pageSpecTable"), pageInquiry:$("pageInquiry"), pageDept:$("pageDept"), pageProcess:$("pageProcess"), pageDisplayCheck:$("pageDisplayCheck"), noticePageList:$("noticePageList"), noticePageCount:$("noticePageCount"), noticePageRefreshBtn:$("noticePageRefreshBtn"), noticeDetailContent:$("noticeDetailContent"), favoritePageList:$("favoritePageList"), favoritePageCount:$("favoritePageCount"), homeFavoriteShortcut:$("homeFavoriteShortcut"), homeFavoriteCount:$("homeFavoriteCount"), homeGreeting:$("homeGreeting"), homeSub:$("homeSub"), homeNoticeTitle:$("homeNoticeTitle"), homeNoticeBody:$("homeNoticeBody"), homeBellBtn:$("homeBellBtn"), homeBellDot:$("homeBellDot"), homeAppVersion:$("homeAppVersion"), homeSearchInput:$("homeSearchInput"), homeSearchBtn:$("homeSearchBtn"), homeSearchSuggestions:$("homeSearchSuggestions"), homeRecentList:$("homeRecentList"), homeRecentToggle:$("homeRecentToggle"), homeRefreshBtn:$("homeRefreshBtn"), dbRefreshConfirmModal:$("dbRefreshConfirmModal"), dbRefreshConfirmBtn:$("dbRefreshConfirmBtn"), dbRefreshCancelBtn:$("dbRefreshCancelBtn"), dbRefreshModal:$("dbRefreshModal"), dbRefreshMessage:$("dbRefreshMessage"), dbRefreshStopBtn:$("dbRefreshStopBtn"),
  itemInput:$("itemInput"), itemSearchBtn:$("itemSearchBtn"), itemCountPill:$("itemCountPill"), itemCategoryChips:$("itemCategoryChips"), itemFilterSummary:$("itemFilterSummary"), quickList:$("quickList"), itemPagination:$("itemPagination"),
  productCard:$("productCard"), productEmpty:$("productEmpty"), photoCarousel:$("photoCarousel"), photoPrev:$("photoPrev"), photoNext:$("photoNext"), photoDots:$("photoDots"), photoCount:$("photoCount"), photoEmpty:$("photoEmpty"), photoLabel:$("photoLabel"),
  modelName:$("modelName"), productName:$("productName"), metaList:$("metaList"), itemPill:$("itemPill"), itemFavoriteBtn:$("itemFavoriteBtn"), detailTabs:$("detailTabs"), detailBox:$("detailBox"), itemDetailContent:$("itemDetailContent"),
  deptSearch:$("deptSearch"), deptChips:$("deptChips"), deptList:$("deptList"), deptCountPill:$("deptCountPill"), storeSelect:$("storeSelect"), logisticsSelect:$("logisticsSelect"), deptFilterPanel:$("deptFilterPanel"), deptFilterIcon:$("deptFilterIcon"), deptFilterTitle:$("deptFilterTitle"), deptFilterDesc:$("deptFilterDesc"), deptRegionSearch:$("deptRegionSearch"), deptResultsTitle:$("deptResultsTitle"), deptMapPanel:$("deptMapPanel"), mapSelectionBar:$("mapSelectionBar"), mapStoreSelectWrap:$("mapStoreSelectWrap"), mapTcSelectWrap:$("mapTcSelectWrap"), mapStoreSelect:$("mapStoreSelect"), mapTcSelect:$("mapTcSelect"), mapMetroToggle:$("mapMetroToggle"), mapBackBtn:$("mapBackBtn"), mapResetBtn:$("mapResetBtn"), mapZoomIn:$("mapZoomIn"), mapZoomOut:$("mapZoomOut"), koreaMap:$("koreaMap"), metroMap:$("metroMap"), mapDetailLayout:$("mapDetailLayout"), mapInfo:$("mapInfo"), mapCoverageList:$("mapCoverageList"),
  processSearch:$("processSearch"), processSearchBtn:$("processSearchBtn"), processSearchWrap:$("processSearchWrap"), processPageHeading:$("processPageHeading"), processSuggest:$("processSuggest"), processRecommendSection:$("processRecommendSection"), processRecommendChips:$("processRecommendChips"), processTypeSection:$("processTypeSection"), processTypeList:$("processTypeList"), processResultSection:$("processResultSection"), processResultTitle:$("processResultTitle"), processResultCount:$("processResultCount"), processTypeResetBtn:$("processTypeResetBtn"), processList:$("processList"), processCountPill:$("processCountPill"), processDetailSection:$("processDetailSection"), processDetailView:$("processDetailView"),
  specCategoryGrid:$("specCategoryGrid"), compareChips:$("compareChips"), compareTableWrap:$("compareTableWrap"), compareCountPill:$("compareCountPill"),
  inquiryType:$("inquiryType"), inquiryStore:$("inquiryStore"), inquiryName:$("inquiryName"), inquiryPhone:$("inquiryPhone"), inquiryOrderNo:$("inquiryOrderNo"), inquiryBody:$("inquiryBody"), inquirySubmitBtn:$("inquirySubmitBtn"), inquiryResult:$("inquiryResult"), inquiryGuideModal:$("inquiryGuideModal"), inquiryGuideClose:$("inquiryGuideClose"), inquiryGuideConfirm:$("inquiryGuideConfirm"),
  displayCheckStore:$("displayCheckStore"), displayCheckUploader:$("displayCheckUploader"), displayCheckYear:$("displayCheckYear"), displayCheckDate:$("displayCheckDate"), displayCheckList:$("displayCheckList"), displayCheckStatus:$("displayCheckStatus"), displayCheckProgressText:$("displayCheckProgressText"), displayCheckProgressBar:$("displayCheckProgressBar"), displayCheckCamera:$("displayCheckCamera"), displayCheckRefreshBtn:$("displayCheckRefreshBtn"), displayCheckUploadFrame:$("displayCheckUploadFrame"),
  imageModal:$("imageModal"), imageModalImg:$("imageModalImg"), imageModalClose:$("imageModalClose"), imageModalPrev:$("imageModalPrev"), imageModalNext:$("imageModalNext"), imageModalCaption:$("imageModalCaption"),
  specViewer:$("specViewer"), specBackBtn:$("specBackBtn"), specViewerTitle:$("specViewerTitle"), specViewerCount:$("specViewerCount"), specCarousel:$("specCarousel"), specPrev:$("specPrev"), specNext:$("specNext"), specDots:$("specDots"), specHelpGuide:$("specHelpGuide"), specHelpBtn:$("specHelpBtn"), specHelpModal:$("specHelpModal"), specHelpClose:$("specHelpClose"), specHelpList:$("specHelpList"), specHelpTitle:$("specHelpTitle")
};

init();

function init(){
  document.body.classList.add("view-home");
  bindEvents();
  renderDetailTabs();
  renderDeptChips();
  renderDeptFilterPanel();
  renderProcessScreen(false);
  renderItemCategoryChips();
  renderSpecCategoryCards();
  prefetchSpecCategoryFirstImages();
  renderCompareChips();
  const cachedLoaded = loadFromCache();
  renderAppVersion();
  // 앱을 새로 열었을 때 이전 상품 상세 화면을 이어 붙이지 않고
  // 항상 홈의 최근 조회 영역부터 시작합니다.
  resetItemLookup();
  appBackStack = [];
  clearOverlayUrl();
  showPage("home", false);
  initializePublishedDb(cachedLoaded).finally(startUpdateSignalWatcher);
}

function bindEvents(){
  // v127: 진열 점검 상수 초기화 전에 실행되던 바인딩을 현재 스크립트 완료 후로 지연합니다.
  window.setTimeout(bindDisplayCheckEvents,0);
  document.querySelectorAll(".page-back-btn").forEach(btn=>btn.addEventListener("click",handleAppBack));
  if(els.globalBackTop) els.globalBackTop.addEventListener("click",handleAppBack);
  if(els.globalBackBottom) els.globalBackBottom.addEventListener("click",handleAppBack);
  if(els.globalHomeBottom) els.globalHomeBottom.addEventListener("click",goHomeNow);
  if(els.dbRefreshConfirmBtn) els.dbRefreshConfirmBtn.addEventListener("click",confirmManualDbRefresh);
  if(els.dbRefreshCancelBtn) els.dbRefreshCancelBtn.addEventListener("click",closeDbRefreshConfirmModal);
  if(els.dbRefreshStopBtn) els.dbRefreshStopBtn.addEventListener("click",stopManualDbRefresh);
  if(els.dbRefreshConfirmModal) els.dbRefreshConfirmModal.addEventListener("click",event=>{
    if(event.target === els.dbRefreshConfirmModal) closeDbRefreshConfirmModal();
  });
  document.addEventListener("keydown",event=>{
    if(event.key === "Escape" && els.dbRefreshConfirmModal?.classList.contains("show")) closeDbRefreshConfirmModal();
  });
  if(els.globalRefreshTop) els.globalRefreshTop.addEventListener("click",()=>requestManualDbRefresh());
  if(els.itemPageRefreshBtn) els.itemPageRefreshBtn.addEventListener("click",()=>requestManualDbRefresh());
  if(els.homeSearchBtn) els.homeSearchBtn.addEventListener("click",runHomeSearch);
  if(els.homeSearchInput){
    els.homeSearchInput.addEventListener("input",debounce(()=>renderHomeSearchSuggestions(els.homeSearchInput.value),70));
    els.homeSearchInput.addEventListener("focus",()=>renderHomeSearchSuggestions(els.homeSearchInput.value));
    els.homeSearchInput.addEventListener("keydown",e=>{
      if(e.key === "Enter"){
        e.preventDefault();
        const first = els.homeSearchSuggestions?.querySelector(".home-search-suggestion");
        if(first) openHomeSearchSuggestion(first.dataset.item || "");
        else runHomeSearch();
      }else if(e.key === "Escape"){
        hideHomeSearchSuggestions();
      }
    });
  }
  if(els.homeBellBtn) els.homeBellBtn.addEventListener("click",openNoticePage);
  const homeDisplayCheckShortcut = document.querySelector(".home-display-check-shortcut");
  if(homeDisplayCheckShortcut) homeDisplayCheckShortcut.addEventListener("click",()=>showPage("displayCheck"));
  if(els.homeFavoriteShortcut) els.homeFavoriteShortcut.addEventListener("click",openFavoritesPage);
  if(els.homeRefreshBtn) els.homeRefreshBtn.addEventListener("click",()=>requestManualDbRefresh());
  if(els.noticePageRefreshBtn) els.noticePageRefreshBtn.addEventListener("click",()=>requestManualDbRefresh(()=>renderNoticePage()));
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){
      appHiddenAt = Date.now();
      return;
    }
    const hiddenFor = appHiddenAt ? Date.now() - appHiddenAt : 0;
    appHiddenAt = 0;
    // 장시간 닫혀 있던 앱이 메모리에서 그대로 복원되면 이전 상세 화면이 남을 수 있어
    // 홈으로 복귀시키고 최근 조회 목록을 다시 표시합니다.
    if(hiddenFor >= APP_RESUME_HOME_MS) restoreHomeAfterResume();
    checkUpdateSignal(true);
  });
  window.addEventListener("pagehide",()=>{ appHiddenAt = Date.now(); });
  window.addEventListener("pageshow",(event)=>{
    if(event.persisted) restoreHomeAfterResume();
  });
  window.addEventListener("online",()=>checkUpdateSignal(true));
  if(els.homeRecentToggle) els.homeRecentToggle.addEventListener("click",toggleRecentList);
  document.querySelectorAll(".home-quick").forEach(btn=>btn.addEventListener("click",()=>{
    const page = btn.dataset.page;
    if(page === "item") openItemLookupReset();
    else if(page === "process") openProcessHome();
    else if(page) showPage(page);
    if(btn.dataset.action === "notice") openNoticePage();
  }));
  els.navItem.addEventListener("click",openItemLookupReset);
  els.navSpecTable.addEventListener("click",()=>showPage("specTable"));
  els.navInquiry.addEventListener("click",()=>showPage("inquiry"));
  els.navDept.addEventListener("click",()=>showPage("dept"));
  els.navProcess.addEventListener("click",openProcessHome);
  els.itemSearchBtn.addEventListener("click",searchItem);
  els.itemInput.addEventListener("input",()=>{
    const value = els.itemInput.value.trim();
    const digits = normalizeItemNo(value);
    if(/^\d{6}$/.test(digits) && /^\d+$/.test(value.replace(/\s+/g,""))) searchItem(false);
    else { quickListCurrentPage = 1; renderQuickList(value); }
  });
  els.itemInput.addEventListener("keydown",(e)=>{ if(e.key === "Enter") searchItem(); });
  if(els.itemCategoryChips){
    els.itemCategoryChips.addEventListener("click",(e)=>{
      const btn = e.target.closest(".item-cat-btn");
      if(!btn) return;
      selectedItemCategoryFilter = btn.dataset.key || "전체";
      // 품목 버튼을 누를 때 기존에 입력된 아이템번호/모델명이 남아 있으면
      // 다른 품목 조회가 0건으로 보일 수 있어 자동으로 검색어를 비웁니다.
      if(els.itemInput) els.itemInput.value = "";
      selectedItem = null;
      selectedTab = "";
      quickListCurrentPage = 1;
      if(els.productCard) els.productCard.style.display = "none";
      if(els.productEmpty) els.productEmpty.style.display = "none";
      renderItemCategoryChips();
      renderQuickList("");
      hideStatus();
    });
  }
  els.deptSearch.addEventListener("input",debounce(()=>{ deptInteracted = true; renderDepartments(); },120));
  els.storeSelect.addEventListener("change",()=>{ deptInteracted = true; renderDepartments(); });
  if(els.mapStoreSelect) els.mapStoreSelect.addEventListener("change",()=>{mapSelectedStore=els.mapStoreSelect.value||"";const st=getMapDataSafe().stores.find(r=>r.name===mapSelectedStore);mapSelectedTc=st?.tc||"";mapMode="store";mapMetroOpen=Boolean(mapSelectedStore);mapZoom=mapSelectedStore?1.12:1;renderMapPanel();if(mapSelectedStore)setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:"smooth",block:"start"}),100);});
  if(els.mapTcSelect) els.mapTcSelect.addEventListener("change",()=>{mapSelectedTc=els.mapTcSelect.value||"";mapSelectedStore="";mapMetroOpen=Boolean(mapSelectedTc);renderMapPanel();if(mapSelectedTc)setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:"smooth",block:"start"}),100);});
  if(els.mapMetroToggle) els.mapMetroToggle.addEventListener("click",()=>{mapMetroOpen=!mapMetroOpen;renderMapPanel();});
  if(els.mapResetBtn) els.mapResetBtn.addEventListener("click",resetMapView);
  if(els.mapBackBtn) els.mapBackBtn.addEventListener("click",()=>{deptFilter="업무지원실";deptInteracted=false;renderDeptChips();renderDeptFilterPanel();renderDepartments();window.scrollTo({top:0,behavior:"smooth"});});
  if(els.mapZoomIn) els.mapZoomIn.addEventListener("click",()=>{mapZoom=Math.min(1.45,Number((mapZoom+.15).toFixed(2)));renderKoreaMap();});
  if(els.mapZoomOut) els.mapZoomOut.addEventListener("click",()=>{mapZoom=Math.max(1,Number((mapZoom-.15).toFixed(2)));renderKoreaMap();});
  if(els.deptMapPanel) els.deptMapPanel.addEventListener("click",e=>{const btn=e.target.closest("[data-map-mode]");if(!btn)return;const next=btn.dataset.mapMode||"all";mapMode=next;if(next==="all"){mapSelectedStore="";mapSelectedTc="";mapMetroOpen=false;mapZoom=1;}else if(next==="store"){mapSelectedStore="";mapSelectedTc="";mapMetroOpen=false;}else if(next==="coverage"){mapSelectedStore="";mapSelectedTc="";mapMetroOpen=false;}renderMapPanel();});
  els.processSearch.addEventListener("input",debounce(()=>{
    processFilter = "전체";
    if(els.processSearch.value.trim() && processViewMode === "home") pushProcessHistory("results");
    renderProcessCurrentView(true);
  },90));
  els.processSearch.addEventListener("focus",()=>renderProcessSuggestions());
  els.processSearch.addEventListener("keydown",(e)=>{ if(e.key === "Enter"){ e.preventDefault(); runProcessSearch("검색"); } });
  if(els.processSearchBtn) els.processSearchBtn.addEventListener("click",()=>runProcessSearch("검색"));
  if(els.processTypeResetBtn) els.processTypeResetBtn.addEventListener("click",()=>{
    resetProcessView(true);
    renderProcessCurrentView(false);
  });
  document.addEventListener("click",(e)=>{
    if(!e.target.closest(".process-search-wrap")) hideProcessSuggestions();
    if(!e.target.closest(".home-search")) hideHomeSearchSuggestions();
  });
  els.inquirySubmitBtn.addEventListener("click",submitInquiry);
  if(els.inquiryGuideClose) els.inquiryGuideClose.addEventListener("click",closeInquiryGuide);
  if(els.inquiryGuideConfirm) els.inquiryGuideConfirm.addEventListener("click",closeInquiryGuide);
  if(els.inquiryGuideModal) els.inquiryGuideModal.addEventListener("click",(e)=>{ if(e.target === els.inquiryGuideModal) closeInquiryGuide(); });
  els.detailBox.addEventListener("click",(e)=>{
    const specBtn = e.target.closest(".spec-open-btn");
    if(specBtn){
      e.stopPropagation();
      openSpecViewer(selectedItem);
      return;
    }
    const img = e.target.closest(".detail-ref-image");
    if(img){
      e.stopPropagation();
      openImageModal([img.src], 0, img.alt || "TV 벽걸이 설치비 안내");
    }
  });
  els.photoCarousel.addEventListener("click",(e)=>{
    const img = e.target.closest("img");
    if(img){
      queueViewLog("대표이미지", viewTargetForItem(selectedItem), selectedItem?.itemNo || "");
      openImageModal(currentImageUrls, Number(img.dataset.index||0), `${safe(selectedItem?.modelName,"제품 이미지")} · ${safe(selectedItem?.itemNo,"")}`);
    }
  });
  bindCarouselSwipe();
  els.photoCarousel.addEventListener("scroll",debounce(updatePhotoControls,80));
  els.photoPrev.addEventListener("click",(e)=>{ e.preventDefault(); e.stopPropagation(); goPhoto(selectedPhotoIndex-1); });
  els.photoNext.addEventListener("click",(e)=>{ e.preventDefault(); e.stopPropagation(); goPhoto(selectedPhotoIndex+1); });
  els.processList.addEventListener("click",(e)=>{
    const img = e.target.closest(".process-img");
    if(img){
      e.stopPropagation();
      openImageModal([img.src], 0, img.alt || "프로세스 이미지");
    }
  });
  if(els.processDetailView) els.processDetailView.addEventListener("click",(e)=>{
    const img = e.target.closest(".process-img");
    if(!img) return;
    e.stopPropagation();
    openImageModal([img.currentSrc || img.src], 0, img.alt || "프로세스 이미지");
  });
  els.imageModalClose.addEventListener("click",closeImageModal);
  els.imageModalPrev.addEventListener("click",(e)=>{ e.stopPropagation(); moveModalImage(-1); });
  els.imageModalNext.addEventListener("click",(e)=>{ e.stopPropagation(); moveModalImage(1); });
  bindModalSwipe();
  els.imageModal.addEventListener("click",(e)=>{ if(e.target === els.imageModal) closeImageModal(); });
  els.specBackBtn.addEventListener("click",closeSpecViewer);
  els.specHelpBtn.addEventListener("click",showSpecHelp);
  els.specHelpClose.addEventListener("click",closeSpecHelp);
  els.specHelpModal.addEventListener("click",(e)=>{ if(e.target === els.specHelpModal) closeSpecHelp(); });
  els.specPrev.addEventListener("click",(e)=>{ e.stopPropagation(); moveSpecViewer(-1); });
  els.specNext.addEventListener("click",(e)=>{ e.stopPropagation(); moveSpecViewer(1); });
  els.specCarousel.addEventListener("scroll",debounce(updateSpecViewerControls,80));
  els.specCarousel.addEventListener("touchstart",(e)=>{
    const t = e.changedTouches && e.changedTouches[0];
    if(!t) return;
    specTapStartX = t.clientX;
    specTapStartY = t.clientY;
    specTapMoved = false;
  },{passive:true});
  els.specCarousel.addEventListener("touchmove",(e)=>{
    const t = e.changedTouches && e.changedTouches[0];
    if(!t) return;
    if(Math.abs(t.clientX - specTapStartX) > 10 || Math.abs(t.clientY - specTapStartY) > 10) specTapMoved = true;
  },{passive:true});
  els.specCarousel.addEventListener("touchend",(e)=>{
    const img = e.target.closest("img");
    if(!img || specTapMoved) return;
    e.preventDefault();
    openSpecImageZoom(Number(img.dataset.index||0));
  },{passive:false});
  els.specCarousel.addEventListener("click",(e)=>{
    const img = e.target.closest("img");
    if(img) openSpecImageZoom(Number(img.dataset.index||0));
  });
  bindSpecViewerSwipe();
  document.addEventListener("keydown",(e)=>{
    if(e.key === "Escape"){
      if(els.inquiryGuideModal && els.inquiryGuideModal.classList.contains("show")) closeInquiryGuide();
      else if(els.specHelpModal.classList.contains("show")) closeSpecHelp();
      else if(els.imageModal.classList.contains("show")) closeImageModal();
      else if(els.specViewer.classList.contains("show")) closeSpecViewer();
      return;
    }
    if(els.imageModal.classList.contains("show")){
      if(e.key === "ArrowLeft") moveModalImage(-1);
      if(e.key === "ArrowRight") moveModalImage(1);
      return;
    }
    if(els.specViewer.classList.contains("show")){
      if(e.key === "ArrowLeft") moveSpecViewer(-1);
      if(e.key === "ArrowRight") moveSpecViewer(1);
    }
  });
  window.addEventListener("popstate",(e)=>{
    if(els.imageModal.classList.contains("show")){
      modalHistoryPushed = false;
      closeImageModal(true);
      return;
    }
    if(els.specViewer.classList.contains("show")){
      specHistoryPushed = false;
      closeSpecViewer(true);
      return;
    }

    const state = e.state || {};
    const statePage = state.hubPage || (state.hubBase ? "home" : "");
    if(statePage === "home" || state.hubBase){
      appBackStack = [];
      showPage("home", false);
      return;
    }
    if(statePage === "process"){
      restoreRouteTrail(state);
      restoreProcessHistoryState(state);
      showPage("process", false);
      return;
    }
    if(APP_ROUTE_PAGES.has(statePage)){
      restoreRouteTrail(state);
      showPage(statePage, false);
      return;
    }
    appBackStack = [];
    showPage("home", false);
    replaceHomeHistoryState();
  });
  ensureInitialHistoryState();
  els.topRefreshBtn.addEventListener("click",()=>requestManualDbRefresh());
  els.floatRefreshBtn.addEventListener("click",()=>requestManualDbRefresh());
}


function normalizeRouteTrail(trail){
  if(!Array.isArray(trail)) return [];
  return trail
    .map(value=>String(value||""))
    .filter(value=>APP_ROUTE_PAGES.has(value) && value !== "itemDetail" && value !== "noticeDetail")
    .slice(-20);
}

function restoreRouteTrail(state){
  appBackStack = normalizeRouteTrail(state && state.hubTrail);
}

function currentRouteState(page=currentPage){
  const target = APP_ROUTE_PAGES.has(page) ? page : "home";
  if(target === "home") return { hubBase:true, hubPage:"home", hubTrail:[] };
  if(target === "process") return { ...processHistoryState(processViewMode || "home"), hubTrail:appBackStack.slice() };
  return { hubPage:target, hubTrail:appBackStack.slice() };
}

function ensureInitialHistoryState(){
  try{
    const state = history.state || {};
    if(state.hubPage || state.hubBase || state.hubOverlay) return;
    history.replaceState({hubBase:true,hubPage:"home",hubTrail:[]}, "", getCleanAppUrl());
  }catch(err){}
}

function replaceHomeHistoryState(){
  try{ history.replaceState({hubBase:true,hubPage:"home",hubTrail:[]}, "", getCleanAppUrl()); }catch(err){}
}

function replaceCurrentRouteState(){
  try{
    const state = currentRouteState(currentPage);
    history.replaceState(state, "", currentPage === "home" ? getCleanAppUrl() : getCleanAppUrl() + "#" + currentPage);
  }catch(err){}
}

function routeFallbackParent(page){
  if(page === "itemDetail") return "item";
  if(page === "noticeDetail") return "notice";
  return "home";
}

function showPage(page, push=true){
  const map = { home:els.pageHome, favorites:els.pageFavorites, notice:els.pageNotice, noticeDetail:els.pageNoticeDetail, item:els.pageItem, itemDetail:els.pageItemDetail, specTable:els.pageSpecTable, inquiry:els.pageInquiry, dept:els.pageDept, process:els.pageProcess, displayCheck:els.pageDisplayCheck };
  const target = map[page] ? page : "home";
  if(push && currentPage && currentPage !== target){
    const nextTrail = appBackStack.slice();
    if(nextTrail[nextTrail.length-1] !== currentPage) nextTrail.push(currentPage);
    appBackStack = normalizeRouteTrail(nextTrail);
    try{
      const state = target === "process"
        ? { ...processHistoryState("home"), hubTrail:appBackStack.slice() }
        : { hubPage:target, hubTrail:appBackStack.slice() };
      history.pushState(state, "", getCleanAppUrl() + "#" + target);
    }catch(err){}
  }
  currentPage = target;
  if(target !== "home") hideHomeSearchSuggestions();
  Object.values(map).filter(Boolean).forEach(el=>el.classList.remove("show"));
  (map[target] || els.pageHome).classList.add("show");
  document.body.classList.toggle("view-home", target === "home");
  document.body.classList.toggle("view-nonhome", target !== "home");
  if(els.mainNav) els.mainNav.classList.toggle("home-mode", target === "home");
  [els.navItem,els.navSpecTable,els.navInquiry,els.navDept,els.navProcess].filter(Boolean).forEach(btn=>btn.classList.remove("active"));
  if(target==="item") els.navItem.classList.add("active");
  if(target==="specTable"){ els.navSpecTable.classList.add("active"); prefetchSpecCategoryFirstImages(); }
  if(target==="inquiry"){
    els.navInquiry.classList.add("active");
    window.setTimeout(openInquiryGuide, 90);
  }
  if(target==="dept"){ els.navDept.classList.add("active"); renderDeptFilterPanel(); }
  if(target==="process"){
    els.navProcess.classList.add("active");
    renderProcessCurrentView(false);
    fetchProcessRecommendations();
  }
  if(target==="home") renderHomeDashboard();
  if(target==="favorites") renderFavoritePage();
  if(target==="notice") renderNoticePage();
  if(target==="noticeDetail") renderNoticeDetail();
  if(target==="displayCheck") openDisplayCheckPage();
  window.scrollTo({top:0,behavior:"smooth"});
}

function handleAppBack(){
  if(els.inquiryGuideModal && els.inquiryGuideModal.classList.contains("show")){ closeInquiryGuide(); return; }
  if(els.imageModal && els.imageModal.classList.contains("show")){ closeImageModal(); return; }
  if(els.specViewer && els.specViewer.classList.contains("show")){ closeSpecViewer(); return; }

  if(currentPage === "home"){
    appBackStack = [];
    replaceHomeHistoryState();
    return;
  }

  const state = history.state || {};
  const isCurrentRoute = state.hubPage === currentPage || (currentPage === "process" && state.hubPage === "process");
  if(isCurrentRoute){
    try{ history.back(); return; }catch(err){}
  }

  const fallback = appBackStack.length ? appBackStack.pop() : routeFallbackParent(currentPage);
  showPage(fallback || "home", false);
  if(currentPage === "home") replaceHomeHistoryState();
  else replaceCurrentRouteState();
}

function resetItemLookup(){
  if(els.itemInput) els.itemInput.value = "";
  selectedItem = null;
  selectedTab = "";
  quickListCurrentPage = 1;
  if(els.productCard) els.productCard.style.display = "none";
  if(els.productEmpty) els.productEmpty.style.display = "none";
  if(els.itemDetailContent) els.itemDetailContent.innerHTML = "";
  renderItemCategoryChips();
  renderQuickList("");
  hideStatus();
}

function openItemLookupReset(){
  showPage("item");
  resetItemLookup();
}

function goHomeNow(){
  hideHomeSearchSuggestions();
  if(els.imageModal && els.imageModal.classList.contains("show")) closeImageModal(true);
  if(els.specViewer && els.specViewer.classList.contains("show")) closeSpecViewer(true);
  appBackStack = [];
  resetItemLookup();
  resetProcessView(true);
  showPage("home", false);
  replaceHomeHistoryState();
}

function restoreHomeAfterResume(){
  if(document.hidden) return;
  goHomeNow();
  renderHomeDashboard();
}


function showStatus(msg,type="warn"){
  els.status.textContent = msg;
  els.status.className = `status show ${type}`;
}
function hideStatus(){ els.status.className = "status"; els.status.textContent = ""; }

function loadFromCache(){
  try{
    const cached = readBestLocalCache();
    if(!cached || !cached.data) return false;
    DB = cached.data;
    if(!Array.isArray(DB.processRecommendations)) DB.processRecommendations = [];
    restoreStableAirconSpecSnapshot(DB);
    bootstrapReady = true;
    rebuildIndex();
    renderAll();
    saveDbCacheSafely(DB, cached.savedAt || Date.now());
    saveStableAirconSpecSnapshot(DB);
    const ageMin = Math.max(0, Math.round((Date.now() - (cached.savedAt||0))/60000));
    els.syncText.textContent = `저장 DB 즉시 표시 · ${ageMin}분 전 저장`;
    hideStatus();
    return true;
  }catch(e){
    console.log(e);
    return false;
  }
}

function getLocalDbCacheKeys(){
  const keys = new Set([CONFIG.CACHE_KEY, ...(CONFIG.LEGACY_CACHE_KEYS || [])]);
  try{
    for(let i=0;i<localStorage.length;i++){
      const key = localStorage.key(i) || "";
      if(
        key === CONFIG.CACHE_KEY ||
        /^costco_item_operation_hub_(?:v\d+_cache|cache_v\d+)$/.test(key) ||
        /^costco_item_operation_hub_cache_v\d+$/.test(key)
      ) keys.add(key);
    }
  }catch(e){}
  return Array.from(keys);
}

function removeLegacyDbCaches(){
  getLocalDbCacheKeys().forEach(key=>{
    if(!key || key === CONFIG.CACHE_KEY) return;
    try{ localStorage.removeItem(key); }catch(e){}
  });
}

function saveDbCacheSafely(db, savedAt=Date.now()){
  if(!db || !Array.isArray(db.items) || !db.items.length) return false;
  const payload = JSON.stringify({ savedAt:Number(savedAt) || Date.now(), data:db });
  try{
    removeLegacyDbCaches();
    localStorage.setItem(CONFIG.CACHE_KEY, payload);
    return true;
  }catch(firstError){
    try{
      removeLegacyDbCaches();
      localStorage.removeItem(CONFIG.CACHE_KEY);
      localStorage.setItem(CONFIG.CACHE_KEY, payload);
      return true;
    }catch(secondError){
      console.warn("DB cache save skipped", secondError || firstError);
      return false;
    }
  }
}

function readBestLocalCache(){
  let best = null;
  const candidates = [];
  getLocalDbCacheKeys().forEach(key=>{
    try{
      const raw = localStorage.getItem(key);
      if(!raw) return;
      const cached = JSON.parse(raw);
      if(!cached || !cached.data || !Array.isArray(cached.data.items) || !cached.data.items.length) return;
      candidates.push({ key, cached });
      const savedAt = Number(cached.savedAt || 0);
      const bestSavedAt = Number(best?.savedAt || 0);
      if(!best || savedAt > bestSavedAt || (savedAt === bestSavedAt && key === CONFIG.CACHE_KEY)){
        best = cached;
      }
    }catch(e){}
  });

  if(!best || !best.data || !Array.isArray(best.data.items)) return best;

  // 가장 최근 캐시에 스펙 행이 빠져 있어도 이전 정상 캐시의 에어컨 스펙만 합쳐서 즉시 사용합니다.
  const savedSpecByItem = new Map();
  candidates
    .sort((a,b)=>Number(b.cached.savedAt || 0) - Number(a.cached.savedAt || 0))
    .forEach(({ cached })=>{
      (cached.data.items || []).forEach(item=>{
        if(itemCategoryGroup(item) !== "에어컨") return;
        const itemNo = normalizeItemNo(item?.itemNo);
        const rows = Array.isArray(item?.specRows)
          ? item.specRows.filter(row=>safe(row?.question, "") || safe(row?.answer, ""))
          : [];
        if(itemNo && rows.length && !savedSpecByItem.has(itemNo)) savedSpecByItem.set(itemNo, rows);
      });
    });

  best.data.items = best.data.items.map(item=>{
    if(itemCategoryGroup(item) !== "에어컨") return item;
    const rows = Array.isArray(item?.specRows)
      ? item.specRows.filter(row=>safe(row?.question, "") || safe(row?.answer, ""))
      : [];
    if(rows.length) return item;
    const savedRows = savedSpecByItem.get(normalizeItemNo(item?.itemNo)) || [];
    return savedRows.length ? { ...item, specRows:savedRows } : item;
  });
  return best;
}


/**
 * v120 시작 동기화
 * - 저장 DB가 있으면 즉시 화면을 보여주고 서버 버전만 빠르게 확인합니다.
 * - 최초 설치처럼 저장 DB가 없으면 관리자가 미리 생성한 publishedDb를 바로 내려받습니다.
 * - 아직 publishedDb가 생성되지 않은 경우에만 기존 시트 직접 읽기 방식으로 한 번 fallback 합니다.
 */
async function initializePublishedDb(cachedLoaded){
  if(!navigator.onLine){
    if(!cachedLoaded) showStatus("인터넷 연결 후 앱을 다시 열어 최초 데이터를 받아 주세요.","err");
    else els.syncText.textContent = "오프라인 · 저장 DB 사용 중";
    return false;
  }

  if(!cachedLoaded) showStatus("최초 데이터를 불러오고 있습니다. 잠시만 기다려주세요.","warn");

  let ok = false;
  if(cachedLoaded){
    ok = await syncPublishedDbIfNeeded({ silent:true, auto:true });
  }else{
    ok = await loadPublishedDb({ silent:false, initial:true });
  }

  if(!ok && !cachedLoaded){
    // 관리자가 v120 배포 DB를 한 번도 만들지 않은 최초 전환 상황만 지원하는 안전장치입니다.
    showStatus("최초 배포 DB가 아직 없어 구글시트에서 직접 데이터를 준비하고 있습니다. 관리자 DB 업데이트를 한 번 실행하면 다음 설치부터 빨라집니다.","warn");
    ok = await loadBootstrap(false, { silent:false });
  }

  if(ok && !cachedLoaded){
    showStatus("최신 DB가 저장되었습니다. 다음 실행부터 즉시 표시됩니다.","ok");
    setTimeout(hideStatus,1800);
  }
  return ok;
}

async function syncPublishedDbIfNeeded(options={}){
  const silent = options.silent === true;
  const auto = options.auto === true;
  const forceDownload = options.forceDownload === true;
  const signal = options.signal || null;
  try{
    if(forceDownload) return await loadPublishedDb({ silent, auto, signal, manual:options.manual === true });
    const meta = await apiGet({ action:"publishedVersion", _:Date.now() }, { signal });
    if(signal?.aborted) throw createAbortError();
    if(!meta || meta.ok === false || meta.available === false){
      lastPublishedDbErrorCode = "PUBLISHED_DB_NOT_READY";
      return false;
    }
    const remote = String(meta.updateVersion || "").trim();
    const local = getRememberedDbUpdateVersion();
    if(!DB.items.length || !local || (remote && remote !== local)){
      return await loadPublishedDb({ silent, auto, signal, manual:options.manual === true });
    }
    lastPublishedDbErrorCode = "";
    els.syncText.textContent = `최신 DB 사용 중 · ${safe(meta.updatedAt || DB.updatedAt, "업데이트 확인 완료")}`;
    return true;
  }catch(e){
    if(signal?.aborted || e?.name === "AbortError") return false;
    console.warn("published DB version check failed",e);
    return false;
  }
}

async function loadPublishedDb(options={}){
  const signal = options.signal || null;
  if(signal?.aborted) return false;
  if(bootstrapLoading) return false;
  bootstrapLoading = true;
  const silent = options.silent === true;
  const auto = options.auto === true;
  const manual = options.manual === true;
  const selectedItemNoBefore = selectedItem ? normalizeItemNo(selectedItem.itemNo) : "";
  const previousDb = DB;
  const previousVersion = safe(previousDb?.updateVersion || previousDb?.homeSettings?.updateVersion, "");
  lastPublishedDbErrorCode = "";

  try{
    if(!silent){
      showStatus(options.initial ? "최초 최신 DB를 내려받고 있습니다." : "관리자가 배포한 최신 DB를 불러오고 있습니다.","warn");
    }else{
      els.syncText.textContent = auto ? "최신 DB 버전 확인 · 자동 동기화 중" : "최신 DB 확인 중";
    }

    const data = await apiGet({ action:"publishedDb", _:Date.now() }, { signal });
    if(signal?.aborted) throw createAbortError();
    if(!data || data.ok === false){
      lastPublishedDbErrorCode = String(data?.code || "PUBLISHED_DB_LOAD_FAILED");
      throw new Error(data?.message || "published DB error");
    }
    if(!Array.isArray(data.items) || !data.items.length) throw new Error("items payload is empty");

    const incomingDb = {
      items: Array.isArray(data.items) ? data.items : [],
      departments: Array.isArray(data.departments) ? data.departments : [],
      mapData: data.mapData && typeof data.mapData === "object" ? data.mapData : {stores:[],logistics:[],coverage:[]},
      processes: Array.isArray(data.processes) ? data.processes : [],
      processRecommendations: Array.isArray(data.processRecommendations) ? data.processRecommendations : [],
      specCompare: Array.isArray(data.specCompare) ? data.specCompare : [],
      notices: Array.isArray(data.notices) ? data.notices : [],
      homeSettings: data.homeSettings || {},
      updateVersion: safe(data.updateVersion || data.homeSettings?.updateVersion, ""),
      updatedAt: data.updatedAt || data.publishedAt || formatToday()
    };

    preserveStableSpecRows(incomingDb, previousDb, previousVersion);
    restoreStableAirconSpecSnapshot(incomingDb);
    DB = incomingDb;
    saveStableAirconSpecSnapshot(DB);
    bootstrapReady = true;
    rebuildIndex();
    if(selectedItemNoBefore) selectedItem = itemMap.get(normalize(selectedItemNoBefore)) || selectedItem;
    saveDbCacheSafely(DB, Date.now());
    rememberDbUpdateVersion(DB.updateVersion);
    renderAll();
    if(currentPage === "item" && selectedItem) renderProduct(selectedItem);
    if(currentPage === "itemDetail" && selectedItem) renderItemTextDetail();
    els.syncText.textContent = `최근 DB 배포: ${safe(DB.updatedAt, formatToday())}`;

    if(auto){
      showStatus("관리자가 배포한 최신 DB가 자동 반영되었습니다.","ok");
      setTimeout(hideStatus,1600);
    }else if(manual){
      showStatus("최신 DB 동기화가 완료되었습니다.","ok");
      setTimeout(hideStatus,1600);
    }else if(!silent){
      hideStatus();
    }
    lastPublishedDbErrorCode = "";
    return true;
  }catch(e){
    if(signal?.aborted || e?.name === "AbortError") return false;
    console.error(e);
    if(lastPublishedDbErrorCode === "PUBLISHED_DB_NOT_READY"){
      if(!silent) showStatus("관리자가 구글시트에서 ‘HUB 관리 → 직원 앱 DB 업데이트’를 먼저 한 번 실행해 주세요.","warn");
    }else if(silent){
      els.syncText.textContent = "저장 DB 사용 중 · 최신 DB 확인 대기";
    }else{
      showStatus("최신 배포 DB를 받지 못했습니다. 기존 저장 DB는 그대로 유지됩니다.","err");
    }
    return false;
  }finally{
    bootstrapLoading = false;
    if(currentPage === "itemDetail" && selectedItem) renderItemTextDetail();
  }
}

function delayMs(ms){ return new Promise(resolve=>setTimeout(resolve,ms)); }
function createAbortError(){
  try{ return new DOMException("요청이 중지되었습니다.","AbortError"); }
  catch(e){ const err = new Error("요청이 중지되었습니다."); err.name = "AbortError"; return err; }
}
function setManualRefreshBusy(busy){
  [els.homeRefreshBtn,els.floatRefreshBtn,els.topRefreshBtn,els.globalRefreshTop,els.itemPageRefreshBtn,els.noticePageRefreshBtn].filter(Boolean).forEach(button=>{
    button.disabled = !!busy;
    button.setAttribute("aria-busy", busy ? "true" : "false");
  });
}
function openDbRefreshConfirmModal(afterSuccess){
  if(manualRefreshPromise) return manualRefreshPromise;
  pendingManualRefreshAfterSuccess = typeof afterSuccess === "function" ? afterSuccess : null;
  if(els.dbRefreshConfirmModal){
    els.dbRefreshConfirmModal.classList.add("show");
    els.dbRefreshConfirmModal.setAttribute("aria-hidden","false");
  }
  document.body.classList.add("db-refresh-confirm-open");
  requestAnimationFrame(()=>els.dbRefreshCancelBtn?.focus());
  return null;
}
function closeDbRefreshConfirmModal(){
  if(els.dbRefreshConfirmModal){
    els.dbRefreshConfirmModal.classList.remove("show");
    els.dbRefreshConfirmModal.setAttribute("aria-hidden","true");
  }
  document.body.classList.remove("db-refresh-confirm-open");
  pendingManualRefreshAfterSuccess = null;
}
function confirmManualDbRefresh(){
  const afterSuccess = pendingManualRefreshAfterSuccess;
  if(els.dbRefreshConfirmModal){
    els.dbRefreshConfirmModal.classList.remove("show");
    els.dbRefreshConfirmModal.setAttribute("aria-hidden","true");
  }
  document.body.classList.remove("db-refresh-confirm-open");
  pendingManualRefreshAfterSuccess = null;
  runManualDbRefresh(afterSuccess);
}
function requestManualDbRefresh(afterSuccess){
  if(manualRefreshPromise) return manualRefreshPromise;
  return openDbRefreshConfirmModal(afterSuccess);
}
function openDbRefreshModal(message="관리자가 배포한 최신 정보를 확인하고 있습니다."){
  if(els.dbRefreshMessage) els.dbRefreshMessage.textContent = message;
  if(els.dbRefreshStopBtn){
    els.dbRefreshStopBtn.disabled = false;
    els.dbRefreshStopBtn.textContent = "새로고침 중지";
  }
  if(els.dbRefreshModal){
    els.dbRefreshModal.classList.add("show");
    els.dbRefreshModal.setAttribute("aria-hidden","false");
  }
  document.body.classList.add("db-refresh-open");
  setManualRefreshBusy(true);
}
function closeDbRefreshModal(){
  if(els.dbRefreshModal){
    els.dbRefreshModal.classList.remove("show");
    els.dbRefreshModal.setAttribute("aria-hidden","true");
  }
  document.body.classList.remove("db-refresh-open");
  setManualRefreshBusy(false);
}
function stopManualDbRefresh(){
  if(!manualRefreshPromise){ closeDbRefreshModal(); return; }
  if(els.dbRefreshStopBtn){
    els.dbRefreshStopBtn.disabled = true;
    els.dbRefreshStopBtn.textContent = "중지 중";
  }
  try{ manualRefreshController?.abort(); }catch(e){}
  closeDbRefreshModal();
  showStatus("DB 새로고침을 중지했습니다. 기존 저장 DB를 계속 사용합니다.","warn");
  setTimeout(hideStatus,2200);
}
async function waitForBootstrapIdle(maxWaitMs=150000, signal=null){
  const started = Date.now();
  while(bootstrapLoading && Date.now()-started < maxWaitMs){
    if(signal?.aborted) return false;
    await delayMs(180);
  }
  return !bootstrapLoading && !signal?.aborted;
}
function runManualDbRefresh(afterSuccess){
  if(manualRefreshPromise) return manualRefreshPromise;
  manualRefreshController = typeof AbortController !== "undefined" ? new AbortController() : null;
  const signal = manualRefreshController?.signal || null;
  openDbRefreshModal("관리자가 배포한 최신 정보를 내려받고 있습니다. 잠시만 기다려주세요.");
  const shownAt = Date.now();
  manualRefreshPromise = (async()=>{
    const idle = await waitForBootstrapIdle(60000, signal);
    if(signal?.aborted) return false;
    if(!idle){
      if(els.dbRefreshMessage) els.dbRefreshMessage.textContent = "현재 진행 중인 DB 확인을 마무리하고 있습니다.";
      await waitForBootstrapIdle(30000, signal);
    }
    if(signal?.aborted) return false;

    const ok = await syncPublishedDbIfNeeded({ forceDownload:true, manual:true, signal });
    if(signal?.aborted) return false;
    const elapsed = Date.now()-shownAt;
    if(elapsed < 700) await delayMs(700-elapsed);
    if(signal?.aborted) return false;
    if(ok){
      if(typeof afterSuccess === "function") afterSuccess();
      return true;
    }
    if(els.dbRefreshMessage){
      els.dbRefreshMessage.textContent = lastPublishedDbErrorCode === "PUBLISHED_DB_NOT_READY"
        ? "관리자가 구글시트의 HUB 관리 메뉴에서 직원 앱 DB 업데이트를 먼저 실행해 주세요."
        : "최신 DB 연결이 지연되고 있습니다. 기존 저장 DB를 계속 사용합니다.";
    }
    await delayMs(2400);
    return false;
  })().finally(()=>{
    closeDbRefreshModal();
    manualRefreshPromise = null;
    manualRefreshController = null;
  });
  return manualRefreshPromise;
}

async function loadBootstrap(force, options={}){
  const signal = options && options.signal ? options.signal : null;
  if(signal?.aborted) return false;
  if(bootstrapLoading) return false;
  bootstrapLoading = true;
  const silent = options && options.silent === true;
  const auto = options && options.auto === true;
  const selectedItemNoBefore = selectedItem ? normalizeItemNo(selectedItem.itemNo) : "";
  const previousDb = DB;
  const previousVersion = safe(previousDb?.updateVersion || previousDb?.homeSettings?.updateVersion, "");
  try{
    if(!silent){
      showStatus(force ? "구글시트 최신 DB를 다시 불러오는 중입니다." : "구글시트 DB를 불러오는 중입니다.", "warn");
    }else{
      els.syncText.textContent = auto ? "업데이트 신호 감지 · 최신 DB 반영 중" : "저장 DB 즉시 표시 · 최신 DB 확인 중";
    }

    const data = await apiGet({ action:"bootstrap", refresh: force ? "1" : "0", _: Date.now() }, { signal });
    if(signal?.aborted) throw createAbortError();
    if(!data || data.ok === false) throw new Error(data?.message || "bootstrap error");
    if(!Array.isArray(data.items) || !data.items.length) throw new Error("items payload is empty");

    const incomingDb = {
      items: Array.isArray(data.items) ? data.items : [],
      departments: Array.isArray(data.departments) ? data.departments : [],
      mapData: data.mapData && typeof data.mapData === "object" ? data.mapData : {stores:[],logistics:[],coverage:[]},
      processes: Array.isArray(data.processes) ? data.processes : [],
      processRecommendations: Array.isArray(data.processRecommendations) ? data.processRecommendations : [],
      specCompare: Array.isArray(data.specCompare) ? data.specCompare : [],
      notices: Array.isArray(data.notices) ? data.notices : [],
      homeSettings: data.homeSettings || {},
      updateVersion: safe(data.updateVersion || data.homeSettings?.updateVersion, ""),
      updatedAt: data.updatedAt || formatToday()
    };

    // 동일한 DB 버전에서 일시적으로 스펙 행이 빠진 응답이 들어오면,
    // 화면에 이미 정상 표시 중인 스펙을 유지해 깜빡임/미등록 오표시를 막습니다.
    preserveStableSpecRows(incomingDb, previousDb, previousVersion);
    restoreStableAirconSpecSnapshot(incomingDb);

    DB = incomingDb;
    saveStableAirconSpecSnapshot(DB);
    bootstrapReady = true;
    rebuildIndex();
    if(selectedItemNoBefore) selectedItem = itemMap.get(normalize(selectedItemNoBefore)) || selectedItem;

    // DB는 버전별로 중복 저장하지 않고 하나의 고정 키에 저장합니다.
    // 오래된 버전 캐시는 먼저 정리해 저장 공간 부족과 다음 실행 시 구형 DB 선택을 막습니다.
    saveDbCacheSafely(DB, Date.now());
    rememberDbUpdateVersion(DB.updateVersion);

    renderAll();
    if(currentPage === "item" && selectedItem) renderProduct(selectedItem);
    if(currentPage === "itemDetail" && selectedItem) renderItemTextDetail();
    els.syncText.textContent = `최근 업데이트: ${safe(DB.updatedAt, formatToday())}`;

    if(auto){
      showStatus("관리자가 등록한 최신 DB가 자동 반영되었습니다.", "ok");
      setTimeout(hideStatus,1600);
    }else if(!silent || force){
      showStatus("DB 동기화가 완료되었습니다. 다음 접속부터 저장 DB가 먼저 바로 표시됩니다.", "ok");
      setTimeout(hideStatus,1800);
    }else{
      hideStatus();
    }
    return true;
  }catch(e){
    if(signal?.aborted || e?.name === "AbortError") return false;
    console.error(e);
    if(silent){
      els.syncText.textContent = "저장 DB 표시 중 · 최신 DB 연결 대기";
    }else{
      showStatus("구글시트 DB를 불러오지 못했습니다. 저장된 DB가 있으면 앱은 저장 DB로 표시됩니다. Apps Script 배포 URL, 권한, 시트명을 확인해 주세요.", "err");
    }
    return false;
  }finally{
    bootstrapLoading = false;
    if(currentPage === "itemDetail" && selectedItem) renderItemTextDetail();
  }
}

function preserveStableSpecRows(incomingDb, previousDb, previousVersion=""){
  if(!incomingDb || !previousDb || !Array.isArray(incomingDb.items) || !Array.isArray(previousDb.items)) return;
  const incomingVersion = safe(incomingDb.updateVersion || incomingDb.homeSettings?.updateVersion, "");
  if(incomingVersion && previousVersion && incomingVersion !== previousVersion) return;

  const previousByNo = new Map();
  previousDb.items.forEach(item=>{
    const no = normalizeItemNo(item?.itemNo);
    if(no) previousByNo.set(no, item);
  });

  incomingDb.items = incomingDb.items.map(item=>{
    const no = normalizeItemNo(item?.itemNo);
    const prev = no ? previousByNo.get(no) : null;
    const nextRows = Array.isArray(item?.specRows) ? item.specRows : [];
    const prevRows = Array.isArray(prev?.specRows) ? prev.specRows : [];
    if(!nextRows.length && prevRows.length) return { ...item, specRows: prevRows };
    return item;
  });
}

function getDbUpdateVersion(db){
  return safe(db?.updateVersion || db?.homeSettings?.updateVersion, "");
}

function readStableAirconSpecSnapshot(){
  try{
    const raw = localStorage.getItem(AIRCON_SPEC_SNAPSHOT_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  }catch(e){
    return null;
  }
}

function restoreStableAirconSpecSnapshot(db){
  if(!db || !Array.isArray(db.items)) return;
  const snapshot = readStableAirconSpecSnapshot();
  if(!snapshot || !snapshot.items) return;
  const dbVersion = getDbUpdateVersion(db);
  const snapshotVersion = safe(snapshot.version, "");
  if(dbVersion && snapshotVersion && dbVersion !== snapshotVersion) return;

  db.items = db.items.map(item=>{
    if(itemCategoryGroup(item) !== "에어컨") return item;
    const rows = Array.isArray(item?.specRows) ? item.specRows : [];
    if(rows.some(row=>safe(row?.question, "") || safe(row?.answer, ""))) return item;
    const itemNo = normalizeItemNo(item?.itemNo);
    const savedRows = itemNo && Array.isArray(snapshot.items[itemNo]) ? snapshot.items[itemNo] : [];
    return savedRows.length ? { ...item, specRows:savedRows } : item;
  });
}

function saveStableAirconSpecSnapshot(db){
  if(!db || !Array.isArray(db.items)) return;
  const items = {};
  db.items.forEach(item=>{
    if(itemCategoryGroup(item) !== "에어컨") return;
    const itemNo = normalizeItemNo(item?.itemNo);
    const rows = Array.isArray(item?.specRows) ? item.specRows.filter(row=>safe(row?.question, "") || safe(row?.answer, "")) : [];
    if(itemNo && rows.length) items[itemNo] = rows;
  });
  if(!Object.keys(items).length) return;
  try{
    localStorage.setItem(AIRCON_SPEC_SNAPSHOT_KEY, JSON.stringify({
      version:getDbUpdateVersion(db),
      savedAt:Date.now(),
      items
    }));
  }catch(e){
    console.warn("aircon spec snapshot save skipped", e);
  }
}

function renderAppVersion(){
  if(els.homeAppVersion) els.homeAppVersion.textContent = CONFIG.APP_VERSION || "v103";
}

function rememberDbUpdateVersion(version){
  const value = String(version || "").trim();
  if(!value) return;
  try{ localStorage.setItem(DB_UPDATE_VERSION_KEY, value); }catch(e){}
}

function getRememberedDbUpdateVersion(){
  try{ return localStorage.getItem(DB_UPDATE_VERSION_KEY) || safe(DB.updateVersion || DB.homeSettings?.updateVersion, ""); }
  catch(e){ return safe(DB.updateVersion || DB.homeSettings?.updateVersion, ""); }
}

function startUpdateSignalWatcher(){
  if(updateSignalTimer) clearInterval(updateSignalTimer);
  updateSignalTimer = setInterval(()=>checkUpdateSignal(false), Number(CONFIG.UPDATE_CHECK_MS || 60000));
}

async function checkUpdateSignal(forceCheck=false){
  if(document.hidden || bootstrapLoading || !navigator.onLine) return;
  const now = Date.now();
  if(!forceCheck && now - lastVersionCheckAt < Math.max(15000, Number(CONFIG.UPDATE_CHECK_MS || 60000) - 1000)) return;
  lastVersionCheckAt = now;
  await syncPublishedDbIfNeeded({ silent:true, auto:true });
}

function viewTargetForItem(item){
  if(!item) return "";
  return [safe(item.itemNo,""), safe(item.modelName,""), safe(item.productName,"")].filter(Boolean).join(" · ").slice(0,220);
}

function queueViewLog(type, target="", itemNo=""){
  const cleanType = String(type || "").trim().slice(0,50);
  const cleanTarget = String(target || "").trim().slice(0,220);
  const cleanItemNo = normalizeItemNo(itemNo || "");
  if(!cleanType) return;
  const dedupeKey = `${cleanType}|${cleanTarget}|${cleanItemNo}`;
  const now = Date.now();
  const prev = recentViewLogTimes.get(dedupeKey) || 0;
  if(now - prev < VIEW_LOG_DEDUPE_MS) return;
  recentViewLogTimes.set(dedupeKey, now);
  const qs = new URLSearchParams({ action:"logView", type:cleanType, target:cleanTarget, itemNo:cleanItemNo, _:String(now) }).toString();
  const url = `${CONFIG.APPS_SCRIPT_URL}?${qs}`;
  try{
    fetch(url, { method:"GET", mode:"no-cors", cache:"no-store", keepalive:true }).catch(()=>{});
  }catch(e){
    try{ const img = new Image(); img.src = url; }catch(err){}
  }
}

async function apiGet(params, options={}){
  const externalSignal = options && options.signal ? options.signal : null;
  if(externalSignal?.aborted) throw createAbortError();
  const qs = new URLSearchParams(params).toString();
  const url = `${CONFIG.APPS_SCRIPT_URL}?${qs}`;
  const isBootstrap = params && params.action === "bootstrap";
  const isForcedBootstrap = isBootstrap && String(params.refresh || "") === "1";
  const isPublishedDb = params && params.action === "publishedDb";
  const timeoutMs = isForcedBootstrap ? 150000 : (isBootstrap ? 120000 : (isPublishedDb ? 90000 : 60000));

  // Apps Script 웹앱은 다른 도메인에서 fetch CORS가 불안정할 수 있어
  // callback을 지원하는 JSONP를 먼저 사용합니다. 최초 구형 fallback은 최대 150초, 미리 생성된 publishedDb 다운로드는 최대 90초까지 기다립니다.
  try{
    return await jsonp(url, timeoutMs, externalSignal);
  }catch(jsonpError){
    if(externalSignal?.aborted || jsonpError?.name === "AbortError") throw createAbortError();
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const abortFromOutside = ()=>controller?.abort();
    if(externalSignal) externalSignal.addEventListener("abort",abortFromOutside,{once:true});
    const timer = controller ? setTimeout(()=>controller.abort(), timeoutMs) : 0;
    try{
      const res = await fetch(url, { method:"GET", cache:"no-store", signal:controller?.signal });
      if(!res.ok) throw new Error("fetch response error");
      const data = await res.json();
      if(externalSignal?.aborted) throw createAbortError();
      return data;
    }finally{
      if(timer) clearTimeout(timer);
      if(externalSignal) externalSignal.removeEventListener("abort",abortFromOutside);
    }
  }
}

function jsonp(url, timeoutMs=60000, signal=null){
  return new Promise((resolve,reject)=>{
    if(signal?.aborted){ reject(createAbortError()); return; }
    const cb = `__costcoHubCb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const s = document.createElement("script");
    const sep = url.includes("?") ? "&" : "?";
    s.src = `${url}${sep}callback=${cb}`;
    s.async = true;
    const onAbort = ()=>{ cleanup(); reject(createAbortError()); };
    const timer = setTimeout(()=>{cleanup();reject(new Error("JSONP timeout"));},Math.max(10000,Number(timeoutMs)||60000));
    function cleanup(){
      clearTimeout(timer);
      if(signal) signal.removeEventListener("abort",onAbort);
      try{ delete window[cb]; }catch(e){ window[cb] = undefined; }
      s.remove();
    }
    if(signal) signal.addEventListener("abort",onAbort,{once:true});
    window[cb] = (data)=>{ cleanup(); resolve(data); };
    s.onerror = ()=>{ cleanup(); reject(new Error("JSONP error")); };
    document.body.appendChild(s);
  });
}

function rebuildIndex(){
  itemMap = new Map();
  DB.items.forEach(item=>{
    const no = normalize(item.itemNo);
    if(no) itemMap.set(no, item);
  });
}


function normalizeHomeSettingKey(value){
  return normalizeText(value).replace(/\s+/g,"");
}
function isHomeSettingNotice(row){
  const type = normalizeHomeSettingKey(row?.type || "");
  return ["홈설정","홈화면설정","대시보드설정"].includes(type);
}
function publicNotices(){
  return Array.isArray(DB.notices)
    ? DB.notices.filter(n => !isHomeSettingNotice(n) && (safe(n?.title,"") || safe(n?.body,"")))
    : [];
}
function homeNoticeSetting(keys, fallback){
  // 이전 공지사항 시트 기반 설정이 남아 있는 구버전 캐시를 위한 예비값입니다.
  const wanted = new Set(keys.map(normalizeHomeSettingKey));
  const rows = Array.isArray(DB.notices) ? DB.notices : [];
  const row = rows.find(n => isHomeSettingNotice(n) && wanted.has(normalizeHomeSettingKey(n?.title || "")));
  return safe(row?.body, fallback);
}
function homeSheetSetting(key, fallback){
  const settings = DB.homeSettings && typeof DB.homeSettings === "object" ? DB.homeSettings : {};
  const direct = safe(settings[key], "");
  if(direct) return direct;
  if(key === "mainGreeting") return homeNoticeSetting(["메인명","메인","홈메인명","홈제목"], fallback);
  if(key === "subGreeting") return homeNoticeSetting(["서브","서브문구","홈서브","부제"], fallback);
  return fallback;
}
function renderHomeDashboard(){
  if(!els.pageHome) return;
  if(els.homeGreeting) els.homeGreeting.textContent = homeSheetSetting("mainGreeting", "아이템 허브");
  if(els.homeSub) els.homeSub.textContent = homeSheetSetting("subGreeting", "오늘도 효율적인 업무를 응원합니다.");
  const notices = publicNotices();
  const notice = notices[0] || {};
  if(els.homeNoticeTitle) els.homeNoticeTitle.textContent = safe(notice.title,"공지사항");
  if(els.homeNoticeBody){
    const body = safe(notice.body,"새로운 안내를 확인하세요.").replace(/\s+/g," ").trim();
    els.homeNoticeBody.textContent = body.length > 54 ? body.slice(0,54) + "…" : body;
  }
  renderAppVersion();
  renderHomeUpdateDot();
  renderFavoriteShortcut();
  renderRecentList();
}
function renderHomeUpdateDot(){
  if(!els.homeBellDot) return;
  const latest = latestUpdateId();
  const seen = localStorage.getItem(UPDATE_SEEN_KEY) || "";
  els.homeBellDot.classList.toggle("show", !!latest && latest !== seen);
}
function latestUpdateId(){
  const rows = publicNotices();
  if(!rows.length) return "";
  return rows.map(n=>[n.date,n.type,n.title,n.body].filter(Boolean).join("|")).sort().pop() || "";
}
function markUpdatesSeen(){ const latest = latestUpdateId(); if(latest) localStorage.setItem(UPDATE_SEEN_KEY, latest); renderHomeUpdateDot(); }
function renderNoticePage(){
  const notices = publicNotices();
  if(els.noticePageCount) els.noticePageCount.textContent = `${notices.length}건`;
  if(!els.noticePageList) return;
  if(!notices.length){
    els.noticePageList.innerHTML = `<div class="notice-page-empty">등록된 공지사항이 없습니다.</div>`;
    return;
  }
  els.noticePageList.innerHTML = notices.map(n=>{
    const key = noticeFavoriteKey(n);
    return `<article class="notice-page-item notice-list-row" data-notice-key="${esc(key)}">
      <button class="notice-list-open" type="button" data-notice-open="${esc(key)}">
        <div class="notice-page-item-title">${styledText(n.title,"공지사항",styleOf(n,"title"))}</div>
        <div class="notice-page-date">${styledText(n.date,"작성일 미등록",styleOf(n,"date"))}</div>
      </button>
      ${contentFavoriteStarButton("notice",key,"notice-list-star")}
      <span class="notice-list-arrow" aria-hidden="true">›</span>
    </article>`;
  }).join("");
  els.noticePageList.querySelectorAll("[data-notice-open]").forEach(button=>{
    button.addEventListener("click",()=>openNoticeDetailByKey(button.dataset.noticeOpen || ""));
  });
  bindContentFavoriteButtons(els.noticePageList);
}
function renderNoticeDetail(){
  if(!els.noticeDetailContent) return;
  const notice = selectedNotice;
  if(!notice){
    els.noticeDetailContent.innerHTML = `<div class="notice-page-empty">선택한 공지사항을 찾을 수 없습니다.</div>`;
    return;
  }
  const key = noticeFavoriteKey(notice);
  els.noticeDetailContent.innerHTML = `
    <div class="notice-detail-head">
      <div class="notice-detail-heading">
        <div class="notice-detail-title">${styledText(notice.title,"공지사항",styleOf(notice,"title"))}</div>
        <div class="notice-detail-date">${styledText(notice.date,"작성일 미등록",styleOf(notice,"date"))}</div>
      </div>
      ${contentFavoriteStarButton("notice",key,"notice-detail-star")}
    </div>
    <div class="notice-detail-divider"></div>
    <div class="notice-detail-body">${styledText(notice.body,"내용이 등록되지 않았습니다.",styleOf(notice,"body"))}</div>
  `;
  bindContentFavoriteButtons(els.noticeDetailContent);
}
function openNoticeDetailByKey(key){
  const notice = findNoticeByFavoriteKey(key);
  if(!notice) return;
  selectedNotice = notice;
  markUpdatesSeen();
  addRecentView({ type:"notice", id:`notice:${key}`, title:notice.title || "공지사항", subtitle:notice.date || "공지사항" });
  showPage("noticeDetail");
}
function openNoticePage(){
  hideHomeSearchSuggestions();
  markUpdatesSeen();
  renderNoticePage();
  showPage("notice");
}
function getRecentViews(){ try{ return JSON.parse(localStorage.getItem(HOME_RECENT_KEY) || "[]").filter(Boolean); }catch(e){ return []; } }
function saveRecentViews(list){ try{ localStorage.setItem(HOME_RECENT_KEY, JSON.stringify(list.slice(0,10))); }catch(e){} }
function addRecentView(entry){
  if(!entry || !entry.id) return;
  const list=getRecentViews().filter(x=>x&&x.id!==entry.id);
  list.unshift(Object.assign({},entry,{time:Date.now()}));
  saveRecentViews(list);
  renderRecentList();
}
function toggleRecentList(){ recentExpanded = !recentExpanded; renderRecentList(); }
function renderRecentList(){
  if(!els.homeRecentList) return;
  const all=getRecentViews().slice(0,10);
  if(recentExpanded && all.length <= 3) recentExpanded = false;
  const list=all.slice(0,recentExpanded?10:3);
  els.homeRecentList.classList.toggle("expanded",recentExpanded);
  if(els.homeRecentToggle){
    els.homeRecentToggle.textContent=recentExpanded?"접기":"전체보기(최근 10개) ›";
    els.homeRecentToggle.disabled = all.length <= 3;
    els.homeRecentToggle.classList.toggle("disabled", all.length <= 3);
  }
  if(!list.length){
    els.homeRecentList.innerHTML=`<div class="home-empty">최근 조회한 아이템, 스펙 비교, 프로세스가 없습니다.</div>`;
    return;
  }
  els.homeRecentList.innerHTML=list.map(r=>renderRecentItem(r)).join("");
  els.homeRecentList.querySelectorAll(".home-recent-item").forEach(card=>{
    const open=()=>openRecentView(card.dataset.id);
    card.addEventListener("click",open);
    card.addEventListener("keydown",event=>{
      if(event.key === "Enter" || event.key === " "){ event.preventDefault(); open(); }
    });
  });
  bindItemFavoriteButtons(els.homeRecentList);
  bindContentFavoriteButtons(els.homeRecentList);
}
function recentContentFavorite(r){
  const type = String(r?.type || "");
  if(type === "spec"){
    const key = String(r.id || "").replace(/^spec:/,"");
    return key ? {type:"spec",key} : null;
  }
  if(type === "process"){
    const row = (DB.processes || []).find(item=>normalizeText(item.title || "")===normalizeText(r.title || "") && (!r.subtitle || normalizeText(item.type || "")===normalizeText(r.subtitle || "")))
      || (DB.processes || []).find(item=>normalizeText(item.title || "")===normalizeText(r.title || ""));
    return row ? {type:"process",key:processFavoriteKey(row)} : null;
  }
  if(type === "notice"){
    const row = publicNotices().find(item=>normalizeText(item.title || "")===normalizeText(r.title || "") && (!r.subtitle || normalizeText(item.date || "")===normalizeText(r.subtitle || "")))
      || publicNotices().find(item=>normalizeText(item.title || "")===normalizeText(r.title || ""));
    return row ? {type:"notice",key:noticeFavoriteKey(row)} : null;
  }
  return null;
}
function renderRecentItem(r){
  const isItem=String(r.type||"")==="item";
  const item = isItem ? findItemForRecent(r) : null;
  const contentFavorite = !isItem ? recentContentFavorite(r) : null;
  const thumbCandidates = item ? getItemThumbnailCandidates(item) : uniqueArray([r.thumbImage].filter(Boolean));
  const thumb=isItem&&thumbCandidates.length?thumbImageHTML(thumbCandidates[0], r.title||'최근 조회', thumbCandidates[1]||""):recentIcon(r.type);
  const star=item
    ? favoriteStarButton(item,"home-recent-favorite-btn")
    : (contentFavorite ? contentFavoriteStarButton(contentFavorite.type,contentFavorite.key,"home-recent-favorite-btn") : "");
  return `<div class="home-recent-item ${star?"has-favorite":""}" role="button" tabindex="0" data-id="${esc(r.id)}"><div class="home-recent-thumb">${thumb}</div><div class="home-recent-content"><div class="home-recent-type">${esc(recentTypeLabel(r.type))}</div><div class="home-recent-title">${esc(r.title||"최근 조회")}</div><div class="home-recent-sub">${esc(r.subtitle||"")}</div></div>${star}<div class="home-recent-arrow">›</div></div>`;
}

function favoriteKeyForItem(item){
  if(!item) return "";
  const no = normalizeItemNo(item.itemNo || "");
  if(no) return `no:${no}`;
  const model = normalizeText(item.modelName || "");
  return model ? `model:${model}` : "";
}
function favoriteItemFromKey(key){
  const value = String(key || "");
  if(!value) return null;
  if(value.startsWith("no:")){
    const no = value.slice(3);
    return (DB.items || []).find(item=>normalizeItemNo(item.itemNo)===no) || null;
  }
  if(value.startsWith("model:")){
    const model = value.slice(6);
    return (DB.items || []).find(item=>normalizeText(item.modelName)===model) || null;
  }
  const normalized = normalizeText(value);
  return (DB.items || []).find(item=>normalizeText(item.itemNo)===normalized || normalizeText(item.modelName)===normalized) || null;
}
function favoriteKeyFromValue(value){
  if(value && typeof value === "object") return favoriteKeyForItem(value);
  const raw = String(value || "");
  if(raw.startsWith("no:") || raw.startsWith("model:")) return raw;
  const item = favoriteItemFromKey(raw);
  return item ? favoriteKeyForItem(item) : "";
}
function getFavoriteItemKeys(){
  try{
    const rows = JSON.parse(localStorage.getItem(ITEM_FAVORITES_KEY) || "[]");
    return Array.isArray(rows) ? uniqueArray(rows.map(String).filter(Boolean)) : [];
  }catch(e){ return []; }
}
function saveFavoriteItemKeys(keys){
  try{ localStorage.setItem(ITEM_FAVORITES_KEY, JSON.stringify(uniqueArray((keys || []).filter(Boolean)))); }catch(e){}
}
function getFavoriteItems(){ return getFavoriteItemKeys().map(favoriteItemFromKey).filter(Boolean); }
function isItemFavorite(itemOrKey){
  const key = favoriteKeyFromValue(itemOrKey);
  return !!key && getFavoriteItemKeys().includes(key);
}
function favoriteStarButton(item, extraClass=""){
  const key = favoriteKeyForItem(item);
  if(!key) return "";
  const active = isItemFavorite(key);
  return `<button class="item-favorite-btn ${esc(extraClass)} ${active?"active":""}" type="button" data-favorite-item="${esc(key)}" aria-label="${active?"즐겨찾기 해제":"즐겨찾기 추가"}" aria-pressed="${active?"true":"false"}"><span aria-hidden="true">${active?"★":"☆"}</span></button>`;
}
function syncItemFavoriteButton(button, itemOrKey){
  if(!button) return;
  const key = favoriteKeyFromValue(itemOrKey);
  if(!key){ button.style.display="none"; return; }
  const active = isItemFavorite(key);
  button.style.display="grid";
  button.dataset.favoriteItem = key;
  button.classList.toggle("active", active);
  button.setAttribute("aria-label", active ? "즐겨찾기 해제" : "즐겨찾기 추가");
  button.setAttribute("aria-pressed", active ? "true" : "false");
  button.innerHTML = `<span aria-hidden="true">${active?"★":"☆"}</span>`;
}
function bindItemFavoriteButtons(root=document){
  if(!root || !root.querySelectorAll) return;
  root.querySelectorAll("[data-favorite-item]").forEach(button=>{
    if(button.dataset.favoriteBound === "1") return;
    button.dataset.favoriteBound = "1";
    button.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      toggleItemFavorite(button.dataset.favoriteItem || "");
    });
  });
}
function refreshFavoriteButtonStates(){
  document.querySelectorAll("[data-favorite-item]").forEach(button=>{
    const key = button.dataset.favoriteItem || "";
    const active = isItemFavorite(key);
    button.classList.toggle("active", active);
    button.setAttribute("aria-label", active ? "즐겨찾기 해제" : "즐겨찾기 추가");
    button.setAttribute("aria-pressed", active ? "true" : "false");
    const icon = button.querySelector("span");
    if(icon) icon.textContent = active ? "★" : "☆";
  });
}
function toggleItemFavorite(itemOrKey){
  const key = favoriteKeyFromValue(itemOrKey);
  if(!key) return;
  const current = getFavoriteItemKeys();
  const exists = current.includes(key);
  const next = exists ? current.filter(row=>row!==key) : [key, ...current.filter(row=>row!==key)];
  saveFavoriteItemKeys(next);
  refreshFavoriteButtonStates();
  renderFavoriteShortcut();
  renderFavoritePage();
  if(els.homeSearchInput && els.homeSearchSuggestions?.classList.contains("show")) renderHomeSearchSuggestions(els.homeSearchInput.value);
  if(els.itemFavoriteBtn && selectedItem) syncItemFavoriteButton(els.itemFavoriteBtn, selectedItem);
}
function processFavoriteKey(row){
  if(!row) return "";
  return `${normalizeText(row.type || "기타")}||${normalizeText(row.title || "")}`;
}
function noticeFavoriteKey(row){
  if(!row) return "";
  return `${normalizeText(row.date || "")}||${normalizeText(row.title || "")}`;
}
function findProcessByFavoriteKey(key){
  const wanted = String(key || "");
  return (DB.processes || []).find(row=>processFavoriteKey(row) === wanted) || null;
}
function findNoticeByFavoriteKey(key){
  const wanted = String(key || "");
  return publicNotices().find(row=>noticeFavoriteKey(row) === wanted) || null;
}
function getContentFavorites(){
  try{
    const rows = JSON.parse(localStorage.getItem(CONTENT_FAVORITES_KEY) || "[]");
    return Array.isArray(rows) ? rows.filter(row=>row && row.type && row.key) : [];
  }catch(e){ return []; }
}
function saveContentFavorites(rows){
  try{ localStorage.setItem(CONTENT_FAVORITES_KEY, JSON.stringify((rows || []).filter(row=>row && row.type && row.key).slice(0,200))); }catch(e){}
}
function resolveContentFavorite(entry){
  if(!entry) return null;
  const type = String(entry.type || "");
  const key = String(entry.key || "");
  if(type === "spec"){
    const cat = SPEC_CATEGORY_IMAGES.find(row=>String(row.key) === key);
    return cat ? { type, key, title:`${cat.label} 스펙 비교`, subtitle:cat.desc || "스펙 비교", source:cat } : (entry.title ? entry : null);
  }
  if(type === "process"){
    const row = findProcessByFavoriteKey(key);
    return row ? { type, key, title:row.title || "프로세스", subtitle:row.type || "프로세스", source:row } : (entry.title ? entry : null);
  }
  if(type === "notice"){
    const row = findNoticeByFavoriteKey(key);
    return row ? { type, key, title:row.title || "공지사항", subtitle:row.date || "작성일 미등록", source:row } : (entry.title ? entry : null);
  }
  return null;
}
function getFavoriteContentEntries(){
  return getContentFavorites().map(resolveContentFavorite).filter(Boolean);
}
function contentFavoriteMeta(type,key){
  return resolveContentFavorite({type:String(type||""),key:String(key||"")});
}
function isContentFavorite(type,key){
  const t = String(type || "");
  const k = String(key || "");
  return !!t && !!k && getContentFavorites().some(row=>row.type===t && row.key===k);
}
function contentFavoriteStarButton(type,key,extraClass=""){
  if(!type || !key) return "";
  const active = isContentFavorite(type,key);
  return `<button class="item-favorite-btn content-favorite-btn ${esc(extraClass)} ${active?"active":""}" type="button" data-content-favorite-type="${esc(type)}" data-content-favorite-key="${esc(key)}" aria-label="${active?"즐겨찾기 해제":"즐겨찾기 추가"}" aria-pressed="${active?"true":"false"}"><span aria-hidden="true">${active?"★":"☆"}</span></button>`;
}
function bindContentFavoriteButtons(root=document){
  if(!root || !root.querySelectorAll) return;
  root.querySelectorAll("[data-content-favorite-type][data-content-favorite-key]").forEach(button=>{
    if(button.dataset.contentFavoriteBound === "1") return;
    button.dataset.contentFavoriteBound = "1";
    button.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      toggleContentFavorite(button.dataset.contentFavoriteType || "", button.dataset.contentFavoriteKey || "");
    });
  });
}
function refreshContentFavoriteButtonStates(){
  document.querySelectorAll("[data-content-favorite-type][data-content-favorite-key]").forEach(button=>{
    const active = isContentFavorite(button.dataset.contentFavoriteType || "", button.dataset.contentFavoriteKey || "");
    button.classList.toggle("active",active);
    button.setAttribute("aria-label",active ? "즐겨찾기 해제" : "즐겨찾기 추가");
    button.setAttribute("aria-pressed",active ? "true" : "false");
    const icon = button.querySelector("span");
    if(icon) icon.textContent = active ? "★" : "☆";
  });
}
function toggleContentFavorite(type,key){
  const t = String(type || "");
  const k = String(key || "");
  if(!t || !k) return;
  const rows = getContentFavorites();
  const exists = rows.some(row=>row.type===t && row.key===k);
  let next;
  if(exists){
    next = rows.filter(row=>!(row.type===t && row.key===k));
  }else{
    const meta = contentFavoriteMeta(t,k) || {type:t,key:k,title:"즐겨찾기",subtitle:""};
    next = [{type:t,key:k,title:meta.title || "즐겨찾기",subtitle:meta.subtitle || ""}, ...rows.filter(row=>!(row.type===t && row.key===k))];
  }
  saveContentFavorites(next);
  refreshContentFavoriteButtonStates();
  renderFavoriteShortcut();
  renderFavoritePage();
  if(currentPage === "notice") renderNoticePage();
  if(currentPage === "noticeDetail") renderNoticeDetail();
  if(currentPage === "process") renderProcessCurrentView(false);
  if(currentPage === "specTable") renderSpecCategoryCards();
  renderRecentList();
}
function renderFavoriteShortcut(){
  const count = getFavoriteItems().length + getFavoriteContentEntries().length;
  if(els.homeFavoriteCount) els.homeFavoriteCount.textContent = `${count}개`;
  if(els.homeFavoriteShortcut) els.homeFavoriteShortcut.classList.toggle("has-items", count > 0);
}
function openFavoritesPage(){
  hideHomeSearchSuggestions();
  renderFavoritePage();
  showPage("favorites");
}
function favoriteGroupHtml(label, rowsHtml, count){
  if(!count) return "";
  return `<section class="favorite-group"><div class="favorite-group-head"><strong>${esc(label)}</strong><span>${count}개</span></div><div class="favorite-group-list">${rowsHtml}</div></section>`;
}
function renderFavoritePage(){
  if(!els.favoritePageList) return;
  const items = getFavoriteItems();
  const content = getFavoriteContentEntries();
  const total = items.length + content.length;
  if(els.favoritePageCount) els.favoritePageCount.textContent = `${total}개`;
  if(!total){
    els.favoritePageList.innerHTML = `<div class="favorite-page-empty"><span aria-hidden="true">☆</span><strong>즐겨찾기한 내용이 없습니다.</strong><small>아이템·스펙 비교·프로세스·공지사항의 별표를 눌러 추가해 주세요.</small></div>`;
    return;
  }

  const contentGroups = {
    spec:content.filter(row=>row.type==="spec"),
    process:content.filter(row=>row.type==="process"),
    notice:content.filter(row=>row.type==="notice")
  };
  els.favoritePageList.innerHTML = [
    favoriteGroupHtml("아이템 조회",items.map(renderFavoritePageItem).join(""),items.length),
    favoriteGroupHtml("스펙 비교",contentGroups.spec.map(renderContentFavoriteItem).join(""),contentGroups.spec.length),
    favoriteGroupHtml("프로세스",contentGroups.process.map(renderContentFavoriteItem).join(""),contentGroups.process.length),
    favoriteGroupHtml("공지사항",contentGroups.notice.map(renderContentFavoriteItem).join(""),contentGroups.notice.length)
  ].join("");

  els.favoritePageList.querySelectorAll("[data-favorite-open]").forEach(card=>{
    const open = ()=>openFavoriteItem(card.dataset.favoriteOpen || "");
    card.addEventListener("click",open);
    card.addEventListener("keydown",event=>{
      if(event.key === "Enter" || event.key === " "){ event.preventDefault(); open(); }
    });
  });
  els.favoritePageList.querySelectorAll("[data-content-open-type][data-content-open-key]").forEach(card=>{
    const open = ()=>openContentFavorite(card.dataset.contentOpenType || "",card.dataset.contentOpenKey || "");
    card.addEventListener("click",open);
    card.addEventListener("keydown",event=>{
      if(event.key === "Enter" || event.key === " "){ event.preventDefault(); open(); }
    });
  });
  bindItemFavoriteButtons(els.favoritePageList);
  bindContentFavoriteButtons(els.favoritePageList);
}
function renderFavoritePageItem(item){
  const key = favoriteKeyForItem(item);
  const thumbCandidates = getItemThumbnailCandidates(item);
  const thumb = thumbCandidates.length ? thumbImageHTML(thumbCandidates[0], safe(item.modelName,"즐겨찾기 품목"), thumbCandidates[1]||"") : categoryIconImageHTML(categoryIconForItem(item), "thumb-icon-img");
  return `<article class="favorite-page-item" role="button" tabindex="0" data-favorite-open="${esc(key)}">
    <div class="favorite-page-thumb">${thumb}</div>
    <div class="favorite-page-copy"><div class="favorite-page-item-no">${styledText(item.itemNo,"아이템번호 미등록",styleOf(item,"itemNo"))}</div><div class="favorite-page-item-model">${styledText(item.modelName,"모델명 미등록",styleOf(item,"modelName"))}</div>${item.productName?`<div class="favorite-page-item-name">${styledText(item.productName,"",styleOf(item,"productName"))}</div>`:""}</div>
    ${favoriteStarButton(item,"favorite-page-star")}
    <div class="favorite-page-arrow" aria-hidden="true">›</div>
  </article>`;
}
function contentFavoriteIcon(type){
  if(type==="spec") return "⚖";
  if(type==="process") return "☷";
  if(type==="notice") return "🔔";
  return "★";
}
function contentFavoriteLabel(type){
  if(type==="spec") return "스펙 비교";
  if(type==="process") return "프로세스";
  if(type==="notice") return "공지사항";
  return "즐겨찾기";
}
function renderContentFavoriteItem(entry){
  return `<article class="favorite-content-item" role="button" tabindex="0" data-content-open-type="${esc(entry.type)}" data-content-open-key="${esc(entry.key)}">
    <div class="favorite-content-icon" aria-hidden="true">${contentFavoriteIcon(entry.type)}</div>
    <div class="favorite-content-copy"><div class="favorite-content-type">${contentFavoriteLabel(entry.type)}</div><div class="favorite-content-title">${esc(entry.title || "즐겨찾기")}</div><div class="favorite-content-sub">${esc(entry.subtitle || "")}</div></div>
    ${contentFavoriteStarButton(entry.type,entry.key,"favorite-page-star")}
    <div class="favorite-page-arrow" aria-hidden="true">›</div>
  </article>`;
}
function openFavoriteItem(key){
  const item = favoriteItemFromKey(key);
  if(!item) return;
  resetItemCategoryFilter();
  showPage("item");
  if(els.itemInput) els.itemInput.value = item.itemNo || item.modelName || "";
  quickListCurrentPage = 1;
  searchItem(false);
}
function openContentFavorite(type,key){
  if(type === "spec"){
    const cat = SPEC_CATEGORY_IMAGES.find(row=>String(row.key)===String(key));
    if(!cat) return;
    showPage("specTable");
    setTimeout(()=>openSpecCategoryViewer(cat),0);
    return;
  }
  if(type === "process"){
    const row = findProcessByFavoriteKey(key);
    if(!row) return;
    openProcessHome();
    setTimeout(()=>openProcessDetail(row),0);
    return;
  }
  if(type === "notice"){
    openNoticeDetailByKey(key);
  }
}
function findItemForRecent(r){
  if(!r) return null;
  const itemNo = normalizeItemNo(r.itemNo || String(r.id||"").replace(/^item:/,""));
  if(itemNo && itemMap.has(itemNo)) return itemMap.get(itemNo);
  const title = normalizeText(r.title || "");
  return (DB.items || []).find(item => normalizeText(item.modelName) === title || normalizeText(item.itemNo) === title) || null;
}
function recentIcon(type){ if(type==="spec") return `<span class="home-quick-icon">⚖</span>`; if(type==="process") return `<span class="home-quick-icon">☷</span>`; if(type==="notice") return `<span class="home-quick-icon">☊</span>`; return `<span class="home-quick-icon">⌕</span>`; }
function recentTypeLabel(type){ if(type==="spec") return "스펙 비교"; if(type==="process") return "프로세스"; if(type==="notice") return "공지사항"; return "아이템"; }
function resetItemCategoryFilter(){
  selectedItemCategoryFilter = "전체";
  quickListCurrentPage = 1;
  renderItemCategoryChips();
}
function openRecentView(id){
  const recent=getRecentViews().find(r=>r.id===id);
  if(!recent) return;
  if(recent.type==="item"){
    resetItemCategoryFilter();
    showPage("item");
    if(els.itemInput) els.itemInput.value=recent.itemNo||recent.title||"";
    searchItem(false);
    return;
  }
  if(recent.type==="spec"){
    const key=String(recent.id||"").replace(/^spec:/,"");
    const cat=SPEC_CATEGORY_IMAGES.find(row=>String(row.key)===key);
    showPage("specTable");
    if(cat) setTimeout(()=>openSpecCategoryViewer(cat),0);
    return;
  }
  if(recent.type==="process"){
    const content=recentContentFavorite(recent);
    const row=content ? findProcessByFavoriteKey(content.key) : null;
    openProcessHome();
    if(row) setTimeout(()=>openProcessDetail(row),0);
    return;
  }
  if(recent.type==="notice"){
    const content=recentContentFavorite(recent);
    if(content) openNoticeDetailByKey(content.key);
    else openNoticePage();
    return;
  }
}
function homeSuggestionScore(item, q){
  const no = normalizeText(item?.itemNo || "");
  const model = normalizeText(item?.modelName || "");
  const product = normalizeText(item?.productName || "");
  const keywords = normalizeText(item?.keywords || "");
  if(no === q || model === q) return 0;
  if(no.startsWith(q)) return 1;
  if(model.startsWith(q)) return 2;
  if(no.includes(q)) return 3;
  if(model.includes(q)) return 4;
  if(product.includes(q)) return 5;
  if(keywords.includes(q)) return 6;
  return 9;
}
function findHomeSearchSuggestions(query){
  const q = normalizeText(query);
  if(!q) return [];
  return (DB.items || [])
    .filter(item=>normalizeText([item.itemNo,item.modelName,item.productName,item.category,item.brand,item.keywords].join(" ")).includes(q))
    .sort((a,b)=>homeSuggestionScore(a,q)-homeSuggestionScore(b,q) || String(a.itemNo||"").localeCompare(String(b.itemNo||"")))
    .slice(0,6);
}
function renderHomeSearchSuggestions(query=""){
  if(!els.homeSearchSuggestions || !els.homeSearchInput) return;
  const q = String(query || "").trim();
  if(!q || currentPage !== "home"){
    hideHomeSearchSuggestions();
    return;
  }
  const rows = findHomeSearchSuggestions(q);
  if(!rows.length){
    els.homeSearchSuggestions.innerHTML = `<div class="home-search-suggestion-empty">연관 품목이 없습니다.</div>`;
    els.homeSearchSuggestions.classList.add("show");
    els.homeSearchInput.setAttribute("aria-expanded","true");
    return;
  }
  els.homeSearchSuggestions.innerHTML = rows.map(item=>{
    const thumbs = getItemThumbnailCandidates(item);
    const thumb = thumbs[0] || "";
    return `<div class="home-search-suggestion" role="option" tabindex="0" data-item="${esc(item.itemNo || item.modelName || "")}">
      <span class="home-search-suggestion-thumb">${thumb ? thumbImageHTML(thumb,safe(item.modelName,"제품 이미지"),thumbs[1]||"") : categoryIconImageHTML(categoryIconForItem(item),"home-search-suggestion-icon")}</span>
      <span class="home-search-suggestion-copy"><strong>${styledText(item.modelName,"모델명 미등록",styleOf(item,"modelName"))}</strong><small><b>${styledText(item.itemNo,"아이템번호 미등록",styleOf(item,"itemNo"))}</b>${item.productName ? ` · ${styledText(item.productName,"",styleOf(item,"productName"))}` : ""}</small></span>
      ${favoriteStarButton(item,"home-search-favorite-btn")}
      <span class="home-search-suggestion-arrow">›</span>
    </div>`;
  }).join("");
  els.homeSearchSuggestions.querySelectorAll(".home-search-suggestion").forEach(card=>{
    const open=()=>openHomeSearchSuggestion(card.dataset.item || "");
    card.addEventListener("click",open);
    card.addEventListener("keydown",event=>{ if(event.key==="Enter" || event.key===" "){ event.preventDefault(); open(); } });
  });
  bindItemFavoriteButtons(els.homeSearchSuggestions);
  els.homeSearchSuggestions.classList.add("show");
  els.homeSearchInput.setAttribute("aria-expanded","true");
}
function hideHomeSearchSuggestions(){
  if(els.homeSearchSuggestions){
    els.homeSearchSuggestions.classList.remove("show");
    els.homeSearchSuggestions.innerHTML = "";
  }
  if(els.homeSearchInput) els.homeSearchInput.setAttribute("aria-expanded","false");
}
function openHomeSearchSuggestion(value){
  const q = String(value || "").trim();
  if(!q) return;
  hideHomeSearchSuggestions();
  resetItemCategoryFilter();
  showPage("item");
  if(els.itemInput) els.itemInput.value = q;
  quickListCurrentPage = 1;
  searchItem(false);
}
function runHomeSearch(){
  const q=String(els.homeSearchInput?.value||"").trim();
  hideHomeSearchSuggestions();
  resetItemCategoryFilter();
  showPage("item");
  if(els.itemInput) els.itemInput.value=q;
  quickListCurrentPage = 1;
  if(q) searchItem(false); else renderQuickList("");
}
function resetProcessView(clearSearch=true){
  processFilter = "전체";
  processViewMode = "home";
  processHistoryView = "home";
  processDetailRow = null;
  processDetailReturn = { mode:"home", query:"", filter:"전체" };
  processPendingOpenIndex = null;
  hideProcessSuggestions();
  if(clearSearch && els.processSearch) els.processSearch.value = "";
}
function processHistoryState(view=processViewMode){
  return {
    hubPage:"process",
    hubTrail:appBackStack.slice(),
    processView:view || "home",
    processQuery:els.processSearch ? els.processSearch.value.trim() : "",
    processFilter:processFilter || "전체",
    processIndex:processDetailRow && Number.isInteger(processDetailRow._dbIndex) ? processDetailRow._dbIndex : null
  };
}
function pushProcessHistory(view){
  if(currentPage !== "process") return;
  if(processHistoryView === view) return;
  processHistoryView = view;
  try{ history.pushState(processHistoryState(view), "", getCleanAppUrl() + `#process-${view}`); }catch(err){}
}
function restoreProcessHistoryState(state){
  const view = state && state.processView ? state.processView : "home";
  processFilter = state && state.processFilter ? state.processFilter : "전체";
  if(els.processSearch) els.processSearch.value = state && state.processQuery ? state.processQuery : "";
  processViewMode = view;
  processHistoryView = view;
  if(view === "detail" && Number.isInteger(state.processIndex)) processDetailRow = (DB.processes || [])[state.processIndex] || null;
  else processDetailRow = null;
  if(view === "home"){
    processFilter = "전체";
    if(els.processSearch) els.processSearch.value = "";
  }
}
function openProcessHome(){
  resetProcessView(true);
  showPage("process");
}
function svgData(str){ return `data:image/svg+xml;utf8,${encodeURIComponent(str)}`; }
function getCategoryIconSvg(label){
  const v=String(label||"");
  if(v.includes("TV")) return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="14" width="48" height="30" rx="2" fill="none" stroke="#5b6778" stroke-width="4"/><path d="M24 52h16" stroke="#5b6778" stroke-width="4" stroke-linecap="round"/><path d="M32 44v8" stroke="#5b6778" stroke-width="4" stroke-linecap="round"/></svg>`);
  if(v.includes("에어컨")) return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="26" y="8" width="12" height="48" rx="2" fill="none" stroke="#5b6778" stroke-width="4"/></svg>`);
  if(v.includes("김치")) return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="18" y="8" width="28" height="48" rx="2" fill="none" stroke="#5b6778" stroke-width="4"/><path d="M18 32h28" stroke="#5b6778" stroke-width="4"/></svg>`);
  if(v.includes("냉장고")) return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="18" y="8" width="28" height="48" rx="2" fill="none" stroke="#5b6778" stroke-width="4"/><path d="M18 28h28" stroke="#5b6778" stroke-width="4"/></svg>`);
  if(v.includes("세탁")) return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="14" y="8" width="36" height="48" rx="2" fill="none" stroke="#5b6778" stroke-width="4"/><circle cx="32" cy="34" r="12" fill="none" stroke="#5b6778" stroke-width="4"/><circle cx="22" cy="18" r="2.5" fill="#5b6778"/><circle cx="30" cy="18" r="2.5" fill="#5b6778"/></svg>`);
  if(v.includes("소형")) return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M20 22h24l-4 30H24l-4-30Z" fill="none" stroke="#5b6778" stroke-width="4"/><path d="M26 22v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#5b6778" stroke-width="4" stroke-linecap="round"/></svg>`);
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="10" y="10" width="44" height="44" rx="12" fill="none" stroke="#5b6778" stroke-width="4"/></svg>`);
}
function categoryIconImageHTML(label, cls="") { const src = getCategoryIconSvg(label); return `<img class="${esc(cls)}" src="${src}" alt="${esc(label||'품목')}" />`; }
function getGithubItemThumbnailUrl(item){
  const itemNo = normalizeItemNo(item?.itemNo);
  if(!itemNo) return "";
  return `${CONFIG.SPEC_IMAGE_RAW_BASE}thumb_${encodeURIComponent(itemNo)}.png?v=${encodeURIComponent(CONFIG.SPEC_IMAGE_CACHE_BUST || "1")}`;
}
function getSheetThumbnailUrl(item){
  // 수동 예비값이 있으면 GitHub 자동 썸네일 실패 시에만 사용합니다.
  return convertDriveImageUrl(item?.manualThumbUrl || item?.representativeThumbUrl || item?.listImageUrl || item?.thumbnailUrl || item?.thumbnail || item?.thumbUrl || "");
}
function getItemThumbnailCandidates(item){
  // 작은 이미지(홈 최근조회/아이템 리스트/상세 진입 전)는 구글시트 URL 입력 없이
  // GitHub images 폴더의 thumb_아이템번호.png를 우선 사용합니다.
  // item_아이템번호.png는 상세 대표이미지용으로 예약되어 있어 작은 이미지에서는 쓰지 않습니다.
  return uniqueArray([getGithubItemThumbnailUrl(item), getSheetThumbnailUrl(item)].filter(Boolean));
}
function getItemThumbnailUrl(item){ return getItemThumbnailCandidates(item)[0] || ""; }
function getRepresentativeImageUrl(item){ return convertDriveImageUrl(item?.imageUrl || ""); }
function thumbImageHTML(src, alt="", fallback="", extra=""){
  const fallbackAttr = fallback ? ` data-fallback="${esc(fallback)}"` : "";
  return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"${fallbackAttr} ${extra} onerror="handleThumbImageError(this);">`;
}
function handleThumbImageError(img){
  const fallback = img && img.dataset ? (img.dataset.fallback || "") : "";
  if(fallback){
    img.removeAttribute("data-fallback");
    img.src = fallback;
    return;
  }
  if(img) img.remove();
}
function categoryIconForLabel(label){ return String(label||""); }
function categoryIconForItem(item){ return itemCategoryGroup(item); }

function renderAll(){
  renderHomeDashboard();
  renderFavoritePage();
  if(els.homeSearchInput?.value) renderHomeSearchSuggestions(els.homeSearchInput.value);
  renderNotice();
  renderItemCategoryChips();
  renderQuickList(els.itemInput.value);
  renderDeptSelectors();
  renderDeptFilterPanel();
  renderDepartments();
  renderSpecCategoryCards();
  prefetchSpecCategoryFirstImages();
  renderCompareChips();
  renderSpecCompare();
  renderProcessScreen(false);
  if(currentPage === "displayCheck") renderDisplayCheckPage();
}

function searchItem(showError=true){
  const raw = els.itemInput.value.trim();
  const qText = normalizeText(raw);
  const digits = normalizeItemNo(raw);
  const numericOnly = /^\d+$/.test(raw.replace(/\s+/g,""));

  if(!qText){
    if(showError) showStatus("아이템번호 6자리 또는 모델명을 입력해 주세요.", "err");
    return;
  }
  if(numericOnly && !/^\d{6}$/.test(digits)){
    if(showError) showStatus("아이템번호는 6자리로 입력하거나 모델명을 입력해 주세요.", "err");
    renderQuickList(raw);
    return;
  }

  quickListCurrentPage = 1;
  const matches = findItemsByQuery(raw);
  if(!matches.length){
    selectedItem = null;
    els.productCard.style.display = "none";
    els.productEmpty.style.display = "block";
    const filterText = selectedItemCategoryFilter === "전체" ? "" : ` 선택한 품목(${selectedItemCategoryFilter}) 안에서`;
    els.productEmpty.textContent = `${raw}${filterText} 검색 결과가 없습니다. 품목 필터를 전체로 바꾸거나 아이템번호/모델명을 확인해 주세요.`;
    showStatus("검색 결과가 없습니다. 품목 필터 또는 검색어를 확인해 주세요.", "err");
    return;
  }
  if(matches.length > 1){
    selectedItem = null;
    els.productCard.style.display = "none";
    els.productEmpty.style.display = "block";
    els.productEmpty.textContent = `${raw} 검색 결과가 ${matches.length}건 있습니다. 아래 목록에서 상품을 선택해 주세요.`;
    renderQuickList(raw);
    if(showError) showStatus("검색 결과가 여러 건입니다. 아래 목록에서 선택해 주세요.", "warn");
    return;
  }
  const item = matches[0];
  selectedItem = item;
  selectedTab = "";
  els.itemInput.value = item.itemNo || item.modelName || raw;
  renderProduct(item);
  queueViewLog("아이템 상세", viewTargetForItem(item), item.itemNo || "");
  addRecentView({ type:"item", id:`item:${item.itemNo || item.modelName}`, itemNo:item.itemNo, title:safe(item.itemNo || item.modelName,"아이템"), subtitle:[item.modelName,item.productName].filter(Boolean).join(" · "), thumbImage:(getItemThumbnailUrl(item) || "") });
  renderQuickList(raw);
  hideStatus();
}

function findItemsByQuery(query){
  const raw = String(query ?? "").trim();
  const qText = normalizeText(raw);
  const digits = normalizeItemNo(raw);
  const numericOnly = /^\d+$/.test(raw.replace(/\s+/g,""));
  if(!qText) return [];

  const baseRows = filterItemsByCategory(DB.items);

  if(numericOnly && /^\d{6}$/.test(digits)){
    const exactNo = baseRows.find(item => normalizeItemNo(item.itemNo) === digits);
    if(exactNo) return [exactNo];
  }

  const exact = baseRows.filter(item => {
    return normalizeText(item.itemNo) === qText || normalizeText(item.modelName) === qText;
  });
  if(exact.length) return exact;

  return baseRows.filter(item => normalizeText([
    item.itemNo,
    item.modelName,
    item.productName,
    item.category,
    item.brand,
    item.keywords
  ].join(" ")).includes(qText));
}

function renderItemCategoryChips(){
  if(!els.itemCategoryChips) return;
  const counts = {};
  ITEM_CATEGORY_FILTERS.forEach(cat => counts[cat.key] = 0);
  DB.items.forEach(item => {
    const group = itemCategoryGroup(item);
    counts["전체"] = (counts["전체"] || 0) + 1;
    if(counts[group] !== undefined) counts[group] += 1;
  });
  els.itemCategoryChips.innerHTML = ITEM_CATEGORY_FILTERS.map(cat => `
    <button class="item-cat-btn ${selectedItemCategoryFilter===cat.key?"active":""}" type="button" data-key="${esc(cat.key)}">
      <span class="cat-icon">${categoryIconImageHTML(cat.label)}</span><span>${esc(cat.label)}</span><span class="cat-count">${counts[cat.key] || 0}</span>
    </button>`).join("");
  updateItemCountPill();
}

function updateItemCountPill(rows=null){
  const list = rows || filterItemsByCategory(DB.items);
  const label = selectedItemCategoryFilter === "전체" ? "" : selectedItemCategoryFilter + " ";
  els.itemCountPill.textContent = `${label}${list.length}건`;
}

function filterItemsByCategory(items){
  const rows = Array.isArray(items) ? items : [];
  if(selectedItemCategoryFilter === "전체") return rows.slice();
  return rows.filter(item => itemCategoryGroup(item) === selectedItemCategoryFilter);
}

function itemCategoryGroup(item){
  // v72: 상품명에 "무풍콤보" 같은 문구가 있어도 세탁기/건조기로 잘못 분류되지 않도록
  // 상품DB의 "품목" 값을 최우선으로 보고, 에어컨을 세탁/건조기보다 먼저 판정합니다.
  const categoryText = normalizeText(item?.category || "");
  if(categoryText.includes("에어컨") || categoryText.includes("aircon") || categoryText === "ac" || categoryText.includes("a/c")) return "에어컨";
  if(categoryText.includes("tv") || categoryText.includes("티비") || categoryText.includes("텔레비전") || categoryText.includes("모니터")) return "TV/모니터";
  if(categoryText.includes("김치")) return "김치냉장고";
  if(categoryText.includes("냉장고") || categoryText.includes("냉동고")) return "냉장고";
  if(categoryText.includes("세탁") || categoryText.includes("건조") || categoryText.includes("원바디")) return "세탁기/건조기";
  if(categoryText.includes("소형") || categoryText.includes("청소기") || categoryText.includes("전자레인지") || categoryText.includes("큐커") || categoryText.includes("인덕션") || categoryText.includes("제습기")) return "소형가전";

  const text = normalizeText([item?.productName, item?.modelName, item?.keywords].join(" "));
  if(text.includes("에어컨") || text.includes("aircon") || text.includes("a/c") || /^(af|ar|aw)/i.test(String(item?.modelName || ""))) return "에어컨";
  if(text.includes("김치")) return "김치냉장고";
  if(text.includes("tv") || text.includes("티비") || text.includes("텔레비전") || text.includes("모니터")) return "TV/모니터";
  if(text.includes("냉장고") || text.includes("냉동고")) return "냉장고";
  if(text.includes("세탁기") || text.includes("건조기") || text.includes("세탁") || text.includes("원바디")) return "세탁기/건조기";
  if(text.includes("소형") || text.includes("청소기") || text.includes("전자레인지") || text.includes("큐커") || text.includes("인덕션") || text.includes("제습기")) return "소형가전";
  return safe(item?.category, "기타");
}

function renderQuickList(query=""){
  const q = normalizeText(query);
  let rows = filterItemsByCategory(DB.items);
  if(q){
    rows = rows.filter(item => normalizeText([item.itemNo,item.modelName,item.productName,item.category,item.brand,item.keywords].join(" ")).includes(q));
  }
  updateItemCountPill(rows);
  const totalPages = Math.max(1, Math.ceil(rows.length / QUICK_LIST_PAGE_SIZE));
  quickListCurrentPage = Math.max(1, Math.min(quickListCurrentPage || 1, totalPages));
  if(els.itemFilterSummary){
    const filterLabel = selectedItemCategoryFilter === "전체" ? "전체" : selectedItemCategoryFilter;
    els.itemFilterSummary.textContent = `${filterLabel} ${rows.length}건`;
  }
  if(!rows.length){
    const msg = selectedItemCategoryFilter === "전체" ? "표시할 아이템이 없습니다." : `${selectedItemCategoryFilter} 품목에 표시할 아이템이 없습니다.`;
    els.quickList.innerHTML = `<div class="empty" style="padding:14px">${esc(msg)}<br/>검색어를 지우거나 품목을 전체로 변경해 주세요.</div>`;
    if(els.itemPagination) els.itemPagination.innerHTML = "";
    return;
  }
  const startIndex = (quickListCurrentPage - 1) * QUICK_LIST_PAGE_SIZE;
  const pageRows = rows.slice(startIndex, startIndex + QUICK_LIST_PAGE_SIZE);
  els.quickList.innerHTML = pageRows.map(item=>{
    const thumbCandidates = getItemThumbnailCandidates(item);
    const thumb = thumbCandidates[0] || "";
    const tag = itemCategoryGroup(item);
    return `
    <div class="quick-item oneui-item-card" role="button" tabindex="0" data-item="${esc(item.itemNo || item.modelName || "")}">
      <div class="quick-thumb">${thumb ? thumbImageHTML(thumb, safe(item.modelName,'제품 이미지'), thumbCandidates[1] || "") : `${categoryIconImageHTML(categoryIconForItem(item), "thumb-icon-img")}`}</div>
      <div class="quick-info">
        <div class="quick-no">${styledText(item.itemNo,"-",styleOf(item,"itemNo"))}</div>
        <div class="quick-model">${styledText(item.modelName,"모델명 미등록",styleOf(item,"modelName"))}</div>
        <div class="quick-prod">${styledText(item.productName || item.category,"",styleOf(item,item.productName?"productName":"category"))}</div>
        <span class="quick-tag">${esc(tag)}</span>
      </div>
      ${favoriteStarButton(item,"quick-favorite-btn")}
      <div class="quick-arrow">›</div>
    </div>`;
  }).join("");
  els.quickList.querySelectorAll(".quick-item").forEach(card=>{
    const open=()=>{ els.itemInput.value = card.dataset.item; searchItem(); };
    card.addEventListener("click",open);
    card.addEventListener("keydown",event=>{ if(event.key==="Enter" || event.key===" "){ event.preventDefault(); open(); } });
  });
  bindItemFavoriteButtons(els.quickList);
  renderItemPagination(totalPages);
}

function renderItemPagination(totalPages){
  if(!els.itemPagination) return;
  if(totalPages <= 1){ els.itemPagination.innerHTML = ""; return; }
  const buttons = [];
  for(let i=1;i<=totalPages;i++){
    buttons.push(`<button class="item-page-btn ${i===quickListCurrentPage?"active":""}" type="button" data-page="${i}" aria-label="${i}페이지">${i}</button>`);
  }
  buttons.push(`<button class="item-page-btn next" type="button" data-page="${Math.min(totalPages, quickListCurrentPage+1)}" ${quickListCurrentPage>=totalPages?"disabled":""} aria-label="다음 페이지">›</button>`);
  els.itemPagination.innerHTML = buttons.join("");
  els.itemPagination.querySelectorAll(".item-page-btn[data-page]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      if(btn.disabled) return;
      quickListCurrentPage = Number(btn.dataset.page) || 1;
      renderQuickList(els.itemInput ? els.itemInput.value : "");
      const top = els.quickList ? els.quickList.getBoundingClientRect().top + window.scrollY - 12 : 0;
      window.scrollTo({top:Math.max(0,top),behavior:"smooth"});
    });
  });
}


function getProductImageUrls(item){
  const raw = [];
  if(Array.isArray(item.imageUrls)) raw.push(...item.imageUrls);
  raw.push(item.imageUrl, item.imageUrl2, item.imageUrl3, item.photoUrl);
  return uniqueArray(raw.flatMap(splitImageUrls).map(convertDriveImageUrl).filter(Boolean));
}

function splitImageUrls(value){
  if(value === undefined || value === null) return [];
  return String(value)
    .split(/[\r\n,|;]/)
    .map(v=>v.trim())
    .filter(Boolean);
}

function uniqueArray(arr){
  const seen = new Set();
  return arr.filter(v=>{
    if(!v || seen.has(v)) return false;
    seen.add(v);
    return true;
  });
}

function renderProductImages(item){
  const urls = getProductImageUrls(item);
  currentImageUrls = urls.slice();
  selectedPhotoIndex = 0;
  els.photoCarousel.innerHTML = "";
  els.photoDots.innerHTML = "";
  if(!urls.length){
    els.photoCarousel.style.display = "none";
    els.photoEmpty.style.display = "block";
    els.photoEmpty.innerHTML = "사진 URL이 없습니다.<br/>구글시트 대표이미지URL 또는 추가이미지URL 칸에 사진 주소를 넣어주세요.";
    els.photoPrev.classList.remove("show");
    els.photoNext.classList.remove("show");
    els.photoDots.style.display = "none";
    els.photoCount.style.display = "none";
    return;
  }
  els.photoCarousel.style.display = "flex";
  els.photoEmpty.style.display = "none";
  els.photoCarousel.scrollLeft = 0;
  els.photoCarousel.innerHTML = urls.map((url,i)=>`<div class="photo-slide"><img src="${esc(url)}" data-index="${i}" alt="${esc(safe(item.modelName,'제품 이미지'))} ${i+1}" loading="lazy" onerror="this.closest('.photo-slide').style.display='none'" /></div>`).join("");
  els.photoDots.innerHTML = urls.map((_,i)=>`<span class="photo-dot ${i===0?'active':''}" data-index="${i}"></span>`).join("");
  els.photoDots.querySelectorAll(".photo-dot").forEach(dot=>dot.addEventListener("click",()=>goPhoto(Number(dot.dataset.index||0))));
  const multi = urls.length > 1;
  els.photoPrev.classList.toggle("show", multi);
  els.photoNext.classList.toggle("show", multi);
  els.photoDots.style.display = multi ? "flex" : "none";
  els.photoCount.style.display = multi ? "inline-flex" : "none";
  updatePhotoControls();
}

function goPhoto(index){
  const slides = els.photoCarousel.querySelectorAll(".photo-slide");
  if(!slides.length) return;
  const next = Math.max(0, Math.min(index, slides.length-1));
  selectedPhotoIndex = next;
  els.photoCarousel.scrollTo({left: els.photoCarousel.clientWidth * next, behavior:"smooth"});
  updatePhotoControls();
}

function updatePhotoControls(){
  const slides = els.photoCarousel.querySelectorAll(".photo-slide");
  if(!slides.length) return;
  const width = els.photoCarousel.clientWidth || 1;
  const idx = Math.max(0, Math.min(Math.round(els.photoCarousel.scrollLeft / width), slides.length-1));
  selectedPhotoIndex = idx;
  els.photoDots.querySelectorAll(".photo-dot").forEach((dot,i)=>dot.classList.toggle("active", i===idx));
  els.photoCount.textContent = `${idx+1}/${slides.length}`;
}

function renderProduct(item){
  if(selectedTab === "wallModel" && !needsWallModel(item)) selectedTab = "";
  els.productCard.style.display = "block";
  els.productEmpty.style.display = "none";
  els.modelName.innerHTML = styledText(item.modelName,"모델명 미등록", styleOf(item,"modelName"));
  els.productName.innerHTML = styledText(item.productName,"상품명 미등록", styleOf(item,"productName"));
  els.itemPill.innerHTML = styledText(item.itemNo,"-", styleOf(item,"itemNo"));
  syncItemFavoriteButton(els.itemFavoriteBtn, item);
  bindItemFavoriteButtons(els.productCard);
  els.photoLabel.innerHTML = styledText(item.category,"PRODUCT", styleOf(item,"category"));
  renderProductImages(item);
  prefetchFeatureImages(item);
  const metas = [
    { value:item.brand, style:styleOf(item,"brand") },
    { value:item.category, style:styleOf(item,"category") },
    { value:item.keywords, style:styleOf(item,"keywords") }
  ].filter(m=>m.value).slice(0,4);
  els.metaList.innerHTML = metas.map(m=>`<span class="pill">${styledText(m.value,"",m.style)}</span>`).join("");
  renderDetailTabs();
  renderDetailBox();
}

function getVisibleDetailTabs(){
  if(!selectedItem) return DETAIL_TABS;
  return DETAIL_TABS.filter(tab => tab.key !== "wallModel" || needsWallModel(selectedItem));
}

function renderDetailTabs(){
  const tabs = getVisibleDetailTabs();
  if(selectedTab && !tabs.some(t=>t.key===selectedTab)) selectedTab = "";
  els.detailTabs.innerHTML = tabs.map(tab=>`<button class="tab-btn ${selectedTab===tab.key?"active":""}" type="button" data-key="${tab.key}">${tab.label}</button>`).join("");
  els.detailTabs.querySelectorAll(".tab-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      if(btn.dataset.key === "spec"){
        openItemDetailPage(selectedItem);
        return;
      }
      if(btn.dataset.key === "feature"){
        openFeatureViewer(selectedItem);
        return;
      }
      selectedTab = btn.dataset.key;
      renderDetailTabs();
      renderDetailBox();
    });
  });
}


const ITEM_DETAIL_TABS = [
  { key:"spec", label:"스펙", field:"spec" },
  { key:"feature", label:"주요기능", field:"feature" }
];

const SPEC_SECTION_LABELS = {
  "에어컨": {
    "1":"기본 사양",
    "2":"냉방/무풍 기능",
    "3":"청정/제습",
    "4":"절전/스마트 기능",
    "5":"이지케어/편의 기능",
    "6":"상품 기본정보"
  }
};

function specSectionLabel(item, sectionNo, customLabel=""){
  const supplied = String(customLabel || "").trim();
  if(supplied) return supplied;
  const cat = itemCategoryGroup(item);
  const key = String(sectionNo || "").trim();
  return (SPEC_SECTION_LABELS[cat] && SPEC_SECTION_LABELS[cat][key]) ? SPEC_SECTION_LABELS[cat][key] : (key ? `구분 ${key}` : "기타");
}

function openItemDetailPage(item){
  if(!item) return;

  // 스펙 클릭 시 네트워크 완료를 기다리지 않습니다.
  // 현재 로컬 DB/스펙 스냅샷에 있는 데이터를 즉시 열고, 최신 DB는 뒤에서 조용히 반영합니다.
  const hydratedItem = restoreAirconSpecForItem(item);
  selectedItem = hydratedItem;
  itemDetailTab = "spec";
  const isAircon = itemCategoryGroup(hydratedItem) === "에어컨";
  const availableParts = isAircon ? getAvailableAirconSpecParts(hydratedItem) : [];
  selectedAirconSpecPart = availableParts[0] || "스탠드";

  queueViewLog("스펙", viewTargetForItem(hydratedItem), hydratedItem.itemNo || "");
  renderItemTextDetail();
  showPage("itemDetail");
  hideStatus();
}

function restoreAirconSpecForItem(item){
  if(!item || itemCategoryGroup(item) !== "에어컨") return item;
  const currentRows = Array.isArray(item.specRows)
    ? item.specRows.filter(row=>safe(row?.question, "") || safe(row?.answer, ""))
    : [];
  if(currentRows.length) return item;

  const itemNo = normalizeItemNo(item.itemNo);
  const snapshot = readStableAirconSpecSnapshot();
  const savedRows = itemNo && snapshot && snapshot.items && Array.isArray(snapshot.items[itemNo])
    ? snapshot.items[itemNo]
    : [];
  if(!savedRows.length) return item;

  const restored = { ...item, specRows:savedRows };
  if(itemNo && itemMap.has(normalize(itemNo))) itemMap.set(normalize(itemNo), restored);
  return restored;
}

const AIRCON_SPEC_PART_ORDER = ["스탠드","벽걸이","실외기","창문형"];

function normalizeAirconSpecPart(value){
  const text = safe(value, "").replace(/\s+/g, "").toLowerCase();
  if(!text) return "스탠드";
  if(text.includes("창문") || text.includes("윈도우핏") || text.includes("window")) return "창문형";
  if(text.includes("벽걸") || text.includes("wall")) return "벽걸이";
  if(text.includes("실외") || text.includes("outdoor")) return "실외기";
  if(text.includes("스탠드") || text.includes("stand")) return "스탠드";
  return "스탠드";
}

function getAvailableAirconSpecParts(item){
  const found = new Set();
  const rows = Array.isArray(item?.specRows) ? item.specRows : [];
  rows.forEach(row=>{
    if(!safe(row?.question, "") && !safe(row?.answer, "")) return;
    found.add(normalizeAirconSpecPart(row?.productPart || row?.part));
  });
  // 구조화 스펙이 하나라도 있으면 그 제품구분만 표시합니다.
  // 따라서 벽걸이 단독/창문형 단독 상품에 불필요한 스탠드 탭이 생기지 않습니다.
  if(found.size === 0 && safe(item?.spec, "")) found.add("스탠드");
  return AIRCON_SPEC_PART_ORDER.filter(part=>found.has(part));
}

function ensureSelectedAirconSpecPart(item){
  const parts = getAvailableAirconSpecParts(item);
  if(parts.length && !parts.includes(selectedAirconSpecPart)) selectedAirconSpecPart = parts[0];
  return parts;
}

function renderStructuredSpecContent(item, airconPart=""){
  let rows = Array.isArray(item?.specRows) ? item.specRows.filter(r=>safe(r.question,"") || safe(r.answer,"")) : [];
  const isAircon = itemCategoryGroup(item) === "에어컨";
  if(isAircon){
    const availableParts = getAvailableAirconSpecParts(item);
    const wanted = availableParts.includes(airconPart) ? airconPart : (availableParts[0] || "스탠드");
    rows = rows.filter(r=>normalizeAirconSpecPart(r.productPart || r.part) === wanted);
    airconPart = wanted;
  }
  if(!rows.length){
    const legacy = safe(item?.spec,"");
    if(legacy && (!isAircon || (airconPart || "스탠드") === "스탠드")){
      return `<div class="item-detail-content">
        <div class="item-detail-content-title">${isAircon ? "스탠드 스펙" : "스펙"}</div>
        <div class="item-detail-content-body">${styledText(legacy,"",styleOf(item,"spec"))}</div>
      </div>`;
    }
    const partText = isAircon && airconPart ? `${airconPart} 스펙이 등록되지 않았습니다.<br>` : "";
    return `<div class="item-detail-content">
      <div class="item-detail-content-title">${isAircon && airconPart ? `${airconPart} 스펙` : "스펙"}</div>
      <div class="item-detail-content-body item-detail-empty">${partText}구글시트의 카테고리별 스펙 시트에 내용을 입력하세요.<br>에어컨은 A열 아이템번호, B열 제품구분, C열 구분번호, D열 질문, E열 답으로 입력합니다.</div>
    </div>`;
  }
  const groups = new Map();
  rows.forEach((r, idx)=>{
    const sec = safe(r.sectionNo || r.section || "기타", "기타");
    if(!groups.has(sec)) groups.set(sec, { label:"", rows:[] });
    const group = groups.get(sec);
    if(!group.label && safe(r.sectionLabel, "")) group.label = safe(r.sectionLabel, "");
    group.rows.push({ ...r, _idx: idx });
  });
  const groupHtml = Array.from(groups.entries()).map(([sec, group])=>`
    <div class="spec-section-card">
      <div class="spec-section-title">${esc(specSectionLabel(item, sec, group.label))}</div>
      <div class="spec-qa-list">
        ${group.rows.map(r=>`
          <div class="spec-qa-row">
            <div class="spec-qa-q">${styledText(r.question || "-", "", r.questionStyle || {})}</div>
            <div class="spec-qa-a">${styledText(r.answer || "-", "", r.answerStyle || {})}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
  return `<div class="spec-section-list">${groupHtml}</div>`;
}

function renderItemTextDetail(){
  if(!els.itemDetailContent || !selectedItem) return;
  const item = selectedItem;
  const thumbCandidates = getItemThumbnailCandidates(item);
  const thumb = thumbCandidates[0] || getItemThumbnailUrl(item) || "";
  const active = ITEM_DETAIL_TABS.find(t=>t.key===itemDetailTab) || ITEM_DETAIL_TABS[0];
  const isAircon = itemCategoryGroup(item) === "에어컨";
  const availableAirconParts = isAircon ? ensureSelectedAirconSpecPart(item) : [];
  const partTabs = isAircon && active.key === "spec" && availableAirconParts.length ? `
    <div class="aircon-part-tabs" aria-label="에어컨 구성별 스펙">
      ${availableAirconParts.map(part=>`<button class="aircon-part-btn ${selectedAirconSpecPart===part?"active":""}" type="button" data-part="${part}">${part}</button>`).join("")}
    </div>` : "";
  els.itemDetailContent.innerHTML = `
    <div class="item-detail-hero">
      <div class="item-detail-thumb">${thumb ? thumbImageHTML(thumb, safe(item.modelName,'제품 이미지'), thumbCandidates[1] || "") : categoryIconImageHTML(categoryIconForItem(item), "thumb-icon-img")}</div>
      <div class="item-detail-info">
        <div class="item-detail-no">${styledText(item.itemNo,"-",styleOf(item,"itemNo"))}</div>
        <div class="item-detail-model">${styledText(item.modelName,"모델명 미등록",styleOf(item,"modelName"))}</div>
        <div class="item-detail-prod">${styledText(item.productName,"상품명 미등록",styleOf(item,"productName"))}</div>
        <span class="item-detail-cat">${styledText(item.category,"품목 미등록",styleOf(item,"category"))}</span>
      </div>
      ${favoriteStarButton(item,"item-detail-favorite-btn")}
    </div>
    <div class="item-detail-tabs item-detail-tabs-two">
      ${ITEM_DETAIL_TABS.map(t=>`<button class="item-detail-tab ${t.key===active.key?"active":""}" type="button" data-key="${esc(t.key)}">${esc(t.label)}</button>`).join("")}
    </div>
    ${partTabs}
    ${renderStructuredSpecContent(item, selectedAirconSpecPart)}
  `;
  bindItemFavoriteButtons(els.itemDetailContent);
  els.itemDetailContent.querySelectorAll(".item-detail-tab").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const key = btn.dataset.key || "spec";
      if(key === "feature"){
        queueViewLog("주요기능", viewTargetForItem(selectedItem), selectedItem?.itemNo || "");
        openFeatureViewer(selectedItem);
        return;
      }
      itemDetailTab = key;
      renderItemTextDetail();
    });
  });
  els.itemDetailContent.querySelectorAll(".aircon-part-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      selectedAirconSpecPart = btn.dataset.part || "스탠드";
      queueViewLog(`스펙-${selectedAirconSpecPart}`, viewTargetForItem(selectedItem), selectedItem?.itemNo || "");
      renderItemTextDetail();
    });
  });
}

function renderNotice(){
  // 공지사항은 팝업을 사용하지 않고 전용 페이지 목록만 갱신합니다.
  renderNoticePage();
}

function renderDetailBox(){
  if(!selectedItem || !selectedTab){
    els.detailBox.innerHTML = "";
    els.detailBox.style.display = "none";
    return;
  }
  els.detailBox.style.display = "block";
  const tab = DETAIL_TABS.find(t=>t.key===selectedTab);
  if(!tab){
    selectedTab = "";
    renderDetailTabs();
    renderDetailBox();
    return;
  }
  if(selectedTab === "spec" || selectedTab === "feature"){
    selectedTab = "";
    renderDetailTabs();
    renderDetailBox();
    return;
  }
  if(selectedTab === "wallModel"){
    const wallModelText = safe(selectedItem.wallModel, "미등록");
    const showTvGuide = isTvItem(selectedItem);
    els.detailBox.innerHTML = `
      <div class="detail-title">${tab.label}</div>
      <div class="wallmodel-stack">
        <div class="wall-model-box">
          <div class="wall-model-label">벽걸이 모델명</div>
          <div class="wall-model-value">${styledText(wallModelText,"미등록",styleOf(selectedItem,"wallModel"))}</div>
        </div>
        ${showTvGuide ? `
          <div class="detail-ref-image-wrap">
            <img src="./tv_wall_install_fee.png" class="detail-ref-image" alt="TV 벽걸이 설치비 안내표" loading="lazy" />
            <div class="detail-help">※ TV 벽걸이 설치비 안내표 전체 이미지입니다. 이미지를 누르면 크게 볼 수 있습니다.</div>
          </div>
        ` : ``}
      </div>
    `;
    return;
  }
  if(selectedTab === "cost"){
    const isAircon = isAirconItem(selectedItem);
    els.detailBox.innerHTML = `
      <div class="detail-title">${tab.label}</div>
      <div class="cost-grid">
        <div class="cost-box"><div class="cost-label">이전설치비용</div><div class="cost-value">${styledText(selectedItem.installCost,"미등록",styleOf(selectedItem,"installCost"))}</div></div>
        <div class="cost-box"><div class="cost-label">철거비용</div><div class="cost-value">${styledText(selectedItem.removalCost,"미등록",styleOf(selectedItem,"removalCost"))}</div></div>
      </div>
      ${selectedItem.costNote || selectedItem.note ? `<div class="detail-body" style="margin-top:10px">${styledText(selectedItem.costNote || selectedItem.note,"",styleOf(selectedItem, selectedItem.costNote ? "costNote" : "note"))}</div>` : ""}
      <div class="cost-warning">
        <p>※ 현재 금액은 이전/설치 단가표 기준입니다.</p>
        ${isAircon ? `<p>※ 환경에 따라 추가 설치비가 발생할 수 있습니다.</p>` : ``}
        <p>※ 자세한 금액은 <span class="cost-phone">1588-4190</span>으로 모델명 확인 후 안내</p>
      </div>
    `;
    return;
  }
  const body = selectedItem[selectedTab] || "";
  if(!body){
    els.detailBox.innerHTML = "";
    els.detailBox.style.display = "none";
    return;
  }
  els.detailBox.innerHTML = `<div class="detail-title">${tab.label}</div><div class="detail-body">${styledText(body,"",styleOf(selectedItem,selectedTab))}</div>`;
}

function deptTypeIconSvg(type){
  if(type === "업무지원실") return `<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 6V4h8v2M8 10h8M8 14h3M14 14h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  if(type === "물류") return `<svg viewBox="0 0 24 24" fill="none"><path d="M3.5 6h10v10h-10V6Zm10 3h4l3 3v4h-7V9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18" r="2" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="18" r="2" stroke="currentColor" stroke-width="1.8"/></svg>`;
  if(type === "서비스") return `<svg viewBox="0 0 24 24" fill="none"><path d="M6 12a6 6 0 0 1 12 0v5a2 2 0 0 1-2 2h-2v-6h4M6 19H5a2 2 0 0 1-2-2v-5h3v7Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  if(type === "지도 보기") return `<svg viewBox="0 0 24 24" fill="none"><path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke="currentColor" stroke-width="1.8"/></svg>`;
  return `<svg viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="18" cy="12" r="1.7" fill="currentColor"/></svg>`;
}

function renderDeptChips(){
  const chips = ["업무지원실","물류","서비스","기타","지도 보기"];
  els.deptChips.innerHTML = chips.map(ch=>`<button class="dept-icon-tab ${deptFilter===ch?"active":""}" type="button" data-type="${ch}"><span class="dept-tab-icon">${deptTypeIconSvg(ch)}</span><span>${ch}</span></button>`).join("");
  els.deptChips.querySelectorAll(".dept-icon-tab").forEach(btn=>{
    btn.addEventListener("click",()=>{
      deptFilter = btn.dataset.type || "업무지원실";
      deptInteracted = false;
      if(els.storeSelect) els.storeSelect.value = "";
      if(els.deptSearch) els.deptSearch.value = "";
      renderDeptChips();
      renderDeptFilterPanel();
      renderDepartments();
    });
  });
}

function renderDeptSelectors(){
  const storeNow = els.storeSelect ? els.storeSelect.value : "";
  const stores = uniqueSorted(DB.departments.filter(r=>!isLogisticsDept(r) && displayDeptType(r)==="업무지원실").map(r=>safe(r.place,"")).filter(Boolean));
  if(els.storeSelect){
    els.storeSelect.innerHTML = `<option value="">점포 선택</option>` + stores.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");
    if(stores.includes(storeNow)) els.storeSelect.value = storeNow;
  }
}

function renderDeptFilterPanel(){
  if(!els.deptFilterPanel) return;
  const type = deptFilter || "업무지원실";
  const isMap = type === "지도 보기";
  const deptShell = document.querySelector("#pageDept .dept-shell");
  if(deptShell){
    deptShell.classList.toggle("map-active", isMap);
    const deptCard = deptShell.closest(".card");
    if(deptCard) deptCard.classList.toggle("map-card-active", isMap);
  }
  els.deptFilterPanel.style.display = isMap ? "none" : "block";
  if(els.deptMapPanel) els.deptMapPanel.classList.toggle("show", isMap);
  const resultsHead = els.deptResultsTitle ? els.deptResultsTitle.closest(".dept-results-head") : null;
  if(resultsHead) resultsHead.style.display = isMap ? "none" : "flex";
  if(els.deptList) els.deptList.style.display = isMap ? "none" : "grid";
  els.deptFilterPanel.classList.toggle("logistics", type === "물류");
  if(els.deptFilterIcon) els.deptFilterIcon.innerHTML = deptTypeIconSvg(type);
  if(els.deptFilterTitle) els.deptFilterTitle.textContent = type;
  const descriptions = {
    "업무지원실":"점포를 선택하면 해당 업무지원실 연락처가 표시됩니다.",
    "물류":"점포를 선택하거나 담당 물류 지역을 직접 검색하세요.",
    "서비스":"등록된 서비스 관련 문의처를 확인하세요.",
    "기타":"추가 등록된 기타 지원 부서를 확인하세요.",
    "지도 보기":"전국 코스트코 점포와 물류 권역을 확인하세요."
  };
  if(els.deptFilterDesc) els.deptFilterDesc.textContent = descriptions[type] || "필요한 연락처를 확인하세요.";
  if(els.storeSelect){
    els.storeSelect.style.display = (type === "업무지원실" || type === "물류") ? "block" : "none";
    els.storeSelect.setAttribute("aria-label", type === "물류" ? "물류 담당 점포 선택" : "업무지원실 점포 선택");
  }
  if(els.deptRegionSearch) els.deptRegionSearch.classList.toggle("show", type === "물류");
  if(els.deptResultsTitle) els.deptResultsTitle.textContent = `${type} 안내`;
}

function deptRowSearchText(r){
  return normalizeText([r.type,r.place,r.deptName,r.phone,r.scope,r.note,r.keywords].join(" "));
}

function renderDepartments(){
  const type = deptFilter || "업무지원실";
  if(type === "지도 보기"){
    if(els.deptCountPill){ const md = getMapDataSafe(); els.deptCountPill.textContent = `${md.stores.length + md.logistics.length}개 거점`; }
    renderMapPanel();
    return;
  }
  const q = normalizeText(els.deptSearch ? els.deptSearch.value : "");
  const selectedStore = els.storeSelect ? els.storeSelect.value : "";
  let rows = DB.departments.filter(r=>displayDeptType(r) === type);

  if(type === "업무지원실" && selectedStore){
    rows = rows.filter(r=>safe(r.place,"") === selectedStore);
  }else if(type === "물류"){
    if(selectedStore){
      const sq = normalizeText(selectedStore);
      rows = rows.filter(r=>deptRowSearchText(r).includes(sq));
    }
    if(q) rows = rows.filter(r=>deptRowSearchText(r).includes(q));
  }

  const typeTotal = DB.departments.filter(r=>displayDeptType(r) === type).length;
  if(els.deptCountPill) els.deptCountPill.textContent = `${typeTotal}건`;

  const needsStore = type === "업무지원실" && !selectedStore;
  const needsLogisticsCondition = type === "물류" && !selectedStore && !q;
  if(needsStore){
    els.deptList.innerHTML = `<div class="dept-empty">위의 <b>점포 선택</b>에서 점포를 고르면<br>해당 업무지원실 연락처가 표시됩니다.</div>`;
    return;
  }
  if(needsLogisticsCondition){
    els.deptList.innerHTML = `<div class="dept-empty">점포를 선택하거나 <b>물류 지역</b>을 입력하면<br>관련 물류 연락처가 표시됩니다.<br><span style="font-size:11px">점포별 물류 연결은 시트의 검색키워드에 점포명을 입력하면 됩니다.</span></div>`;
    return;
  }
  if(!rows.length){
    const emptyMsg = type === "기타" ? "현재 등록된 기타 지원 부서가 없습니다.<br>시트에 추가하면 자동으로 표시됩니다." : "선택한 조건에 맞는 연락처가 없습니다.";
    els.deptList.innerHTML = `<div class="dept-empty">${emptyMsg}</div>`;
    return;
  }

  els.deptList.innerHTML = rows.map(r=>{
    const rowType = displayDeptType(r);
    const cardClass = rowType === "물류" ? "logistics" : rowType === "서비스" ? "service" : "";
    const title = r.place || r.deptName || rowType;
    return `<div class="dept-modern-card ${cardClass}">
      <div class="dept-card-head">
        <div><div class="dept-card-place">${styledText(title,"미등록",styleOf(r,r.place?"place":"deptName"))}</div>${r.scope ? `<div class="dept-card-scope">${styledText(r.scope,"",styleOf(r,"scope"))}</div>` : ""}</div>
        <span class="dept-type-badge">${esc(rowType)}</span>
      </div>
      <div class="dept-detail-grid">
        ${r.deptName && r.deptName !== title ? `<div class="dept-detail-row"><div class="dept-detail-label">부서</div><div class="dept-detail-value">${styledText(r.deptName,"-",styleOf(r,"deptName"))}</div></div>` : ""}
        <div class="dept-detail-row"><div class="dept-detail-label">연락처</div><div class="dept-detail-value">${styledText(r.phone,"-",styleOf(r,"phone"))}</div></div>
        ${r.note ? `<div class="dept-detail-row"><div class="dept-detail-label">이용 안내</div><div class="dept-detail-value">${styledText(r.note,"",styleOf(r,"note"))}</div></div>` : ""}
      </div>
      ${r.phone ? `<a class="dept-phone-link" href="tel:${String(r.phone).replace(/[^0-9+]/g,"")}">☎ 전화 연결</a>` : ""}
    </div>`;
  }).join("");
}


function getMapDataSafe(){
  const md = DB.mapData && typeof DB.mapData === "object" ? DB.mapData : {};
  const stores = Array.isArray(md.stores) && md.stores.length ? md.stores : FALLBACK_MAP_DATA.stores;
  const logistics = Array.isArray(md.logistics) && md.logistics.length ? md.logistics : FALLBACK_MAP_DATA.logistics;
  const coverage = Array.isArray(md.coverage) && md.coverage.length ? md.coverage : FALLBACK_MAP_DATA.coverage;
  return { stores, logistics, coverage };
}
function normalizeProvinceName(v){
  const s = String(v||"").replace(/특별자치도|특별자치시|광역시|특별시|도/g,"").trim();
  const map={"서울":"서울","경기":"경기","인천":"인천","강원":"강원","충북":"충북","충청북":"충북","충남":"충남","충청남":"충남","세종":"세종","대전":"대전","경북":"경북","경상북":"경북","대구":"대구","울산":"울산","부산":"부산","경남":"경남","경상남":"경남","전북":"전북","전라북":"전북","광주":"광주","전남":"전남","전라남":"전남","제주":"제주"};
  return map[s]||s;
}
function mapLogisticsKind(row){
  const direct=normalizeText(row?.kind||row?.type||"");
  const name=normalizeText(row?.name||"");
  if(name === "제주dc" || direct === "tc") return "tc";
  if(direct.includes("물류센터")||direct==="센터"||name.includes("물류센터")) return "center";
  return "tc";
}
function mapProvinceShapes(){
  return [
    ["강원","48,5 72,5 88,20 86,34 78,43 61,39 51,27"],
    ["경기","29,15 47,11 57,22 55,38 39,43 26,33"],
    ["서울","38,23 47,22 49,28 40,30"],
    ["인천","24,23 37,22 38,32 27,34"],
    ["충북","47,38 62,35 70,48 62,59 48,56"],
    ["충남","27,36 47,38 48,57 38,65 23,55"],
    ["세종","42,47 48,46 49,53 43,55"],
    ["대전","45,54 52,53 53,60 46,62"],
    ["경북","62,39 82,37 91,54 84,69 72,72 62,65 55,54"],
    ["대구","66,57 74,56 76,64 68,67"],
    ["전북","29,59 48,58 58,68 49,76 29,73"],
    ["경남","50,68 69,65 80,72 73,88 54,90 43,79"],
    ["울산","76,68 84,66 87,75 79,79"],
    ["부산","69,82 79,78 83,87 74,92"],
    ["광주","35,75 43,74 45,82 36,85"],
    ["전남","20,70 35,70 51,80 48,95 28,98 15,85"],
    ["제주","27,103 48,101 52,108 31,111"]
  ];
}
function mapQueryUrl(provider, query){
  const q=encodeURIComponent(query||"");
  return provider==="naver" ? `https://map.naver.com/p/search/${q}` : `https://map.kakao.com/link/search/${q}`;
}
function resetMapView(){
  mapMode="all";
  mapSelectedStore="";
  mapSelectedTc="";
  mapMetroOpen=false;
  mapZoom=1;
  renderMapPanel();
}
function renderMapPanel(){
  if(!els.deptMapPanel) return;
  const md=getMapDataSafe();
  const tcRows=md.logistics.filter(r=>mapLogisticsKind(r)==="tc");
  if(els.mapStoreSelect){
    const current=mapSelectedStore;
    els.mapStoreSelect.innerHTML=`<option value="">코스트코 점포 선택</option>`+md.stores.slice().sort((a,b)=>processLocaleCompare(a.name,b.name)).map(r=>`<option value="${esc(r.name)}">${esc(r.name)}</option>`).join("");
    if(md.stores.some(r=>r.name===current)) els.mapStoreSelect.value=current;
  }
  if(els.mapTcSelect){
    const current=mapSelectedTc;
    const pool=mapMode==="coverage"?tcRows:md.logistics;
    const label="TC 선택";
    els.mapTcSelect.innerHTML=`<option value="">${label}</option>`+pool.slice().sort((a,b)=>processLocaleCompare(a.name,b.name)).map(r=>`<option value="${esc(r.name)}">${esc(r.name)}</option>`).join("");
    if(pool.some(r=>r.name===current)) els.mapTcSelect.value=current; else if(current && mapMode!=="all") mapSelectedTc="";
  }
  const needStore=mapMode==="store";
  const needTc=mapMode==="coverage";
  if(els.mapSelectionBar) els.mapSelectionBar.classList.toggle("show",needStore||needTc);
  if(els.mapStoreSelectWrap) els.mapStoreSelectWrap.classList.toggle("show",needStore);
  if(els.mapTcSelectWrap) els.mapTcSelectWrap.classList.toggle("show",needTc);
  els.deptMapPanel.querySelectorAll(".map-mode-btn").forEach(btn=>btn.classList.toggle("active",btn.dataset.mapMode===mapMode));
  if(els.mapMetroToggle) els.mapMetroToggle.textContent=mapMetroOpen?"상세 닫기":"상세 확대 보기";
  if(els.mapDetailLayout){
    els.mapDetailLayout.classList.toggle("metro-open",mapMetroOpen);
    els.mapDetailLayout.classList.toggle("detail-open",mapMetroOpen && Boolean(mapSelectedTc||mapSelectedStore));
  }
  renderKoreaMap();
  renderMetroMap();
  renderMapInfo();
  renderMapCoverageList();
}
function mapMarkerMarkup(row,kind,selected=false,showLabel=true){
  const x=Number(row.x)||0, y=Number(row.y)||0;
  const label=String(row.name||"");
  const cls=kind==="store"?"store":(kind==="center"?"center":"tc");
  const attr=kind==="store"?`data-store="${esc(row.name)}"`:`data-tc="${esc(row.name)}"`;
  const width=Math.max(8,Math.min(22,label.length*2.7+5));
  const labelMarkup=showLabel?`<g class="map-marker-label"><rect x="1.8" y="-2.2" width="${width}" height="4.4" rx="1.5"/><text x="3" y=".55">${esc(label)}</text></g>`:"";
  return `<g class="map-marker ${cls} ${selected?"selected":""}" ${attr} transform="translate(${x} ${y})"><path class="pin" d="M0,-1.25 C-.78,-1.25 -1.34,-.7 -1.34,.04 C-1.34,.94 0,2.15 0,2.15 C0,2.15 1.34,.94 1.34,.04 C1.34,-.7 .78,-1.25 0,-1.25Z"/><circle class="pin-hole" cx="0" cy="-.08" r=".39"/>${labelMarkup}</g>`;
}
function renderKoreaMap(){
  if(!els.koreaMap) return;
  const md=getMapDataSafe();
  const selectedTc=md.logistics.find(r=>r.name===mapSelectedTc);
  const selectedStore=md.stores.find(r=>r.name===mapSelectedStore);
  const coverageRows=mapSelectedTc?md.coverage.filter(r=>r.tc===mapSelectedTc):[];
  const provinces=new Set(coverageRows.map(r=>normalizeProvinceName(r.province)).filter(Boolean));
  const shapes=mapProvinceShapes().map(([name,points])=>{
    const pts=points.split(" ");
    const cx=pts.reduce((s,p)=>s+Number(p.split(",")[0]),0)/pts.length;
    const cy=pts.reduce((s,p)=>s+Number(p.split(",")[1]),0)/pts.length;
    const active=mapMode==="coverage"&&mapSelectedTc&&provinces.has(name);
    return `<polygon class="map-province ${active?"active":""}" data-province="${name}" points="${points}"/><text class="map-province-label" x="${cx}" y="${cy}">${name}</text>`;
  }).join("");
  const islandDefs=[
    {name:"강화",keys:["강화군"],cx:25.5,cy:27,rx:2.2,ry:1.7},
    {name:"울릉",keys:["울릉군","울릉도"],cx:94,cy:55,rx:1.25,ry:1.7},
    {name:"거제",keys:["거제시","거제도"],cx:72,cy:92,rx:1.8,ry:2.1},
    {name:"남해",keys:["남해군"],cx:58,cy:94,rx:1.6,ry:1.7},
    {name:"진도",keys:["진도군"],cx:20,cy:96,rx:1.6,ry:1.7},
    {name:"신안",keys:["신안군"],cx:14,cy:88,rx:2.2,ry:2.1},
    {name:"제주",keys:["제주특별자치도","제주시","서귀포시"],cx:38,cy:107,rx:9,ry:3.7}
  ];
  const activeAreas=new Set(coverageRows.map(r=>normalizeText(r.area)));
  const islands=islandDefs.map(v=>{const active=mapMode==="coverage"&&mapSelectedTc&&v.keys.some(k=>activeAreas.has(normalizeText(k)));return `<ellipse class="map-island ${active?"active":""}" cx="${v.cx}" cy="${v.cy}" rx="${v.rx}" ry="${v.ry}"/><text class="map-island-label" x="${v.cx}" y="${v.cy+.7}">${v.name}</text>`;}).join("");
  let stores=[]; let logistics=[];
  if(mapMode==="all"){ stores=md.stores; logistics=md.logistics; }
  else if(mapMode==="store"){
    stores=mapSelectedStore?md.stores.filter(r=>r.name===mapSelectedStore):md.stores;
    if(selectedStore?.tc) logistics=md.logistics.filter(r=>r.name===selectedStore.tc);
  }else if(mapMode==="coverage"){
    logistics=mapSelectedTc?md.logistics.filter(r=>r.name===mapSelectedTc):md.logistics;
    if(mapSelectedTc) stores=md.stores.filter(r=>r.tc===mapSelectedTc);
  }
  const connector=(selectedStore&&selectedTc)?`<path class="map-connection" d="M${Number(selectedStore.x)||0},${Number(selectedStore.y)||0} L${Number(selectedTc.x)||0},${Number(selectedTc.y)||0}"/>`:"";
  const labelAll=mapMode!=="all";
  const storeMarks=stores.map(r=>mapMarkerMarkup(r,"store",mapSelectedStore===r.name,labelAll||mapSelectedStore===r.name)).join("");
  const logisticsMarks=logistics.map(r=>mapMarkerMarkup(r,"tc",mapSelectedTc===r.name,labelAll||mapSelectedTc===r.name)).join("");
  const zoom=Math.max(1,Math.min(1.45,mapZoom||1));
  const vbW=100/zoom, vbH=118/zoom, vbX=(100-vbW)/2, vbY=(118-vbH)/2;
  els.koreaMap.innerHTML=`<svg class="korea-map-svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" role="img" aria-label="전국 코스트코 및 물류 권역 지도"><image href="data:image/png;base64,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" x="0" y="0" width="100" height="118" preserveAspectRatio="none"/><g class="map-province-layer">${shapes}${islands}</g>${connector}${storeMarks}${logisticsMarks}</svg>`;
  els.koreaMap.querySelectorAll("[data-store]").forEach(el=>el.addEventListener("click",()=>{
    mapSelectedStore=el.dataset.store||"";
    const st=md.stores.find(r=>r.name===mapSelectedStore);
    mapSelectedTc=st?.tc||"";
    mapMode="store";
    mapMetroOpen=true;
    renderMapPanel();
    setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:"smooth",block:"start"}),100);
  }));
  els.koreaMap.querySelectorAll("[data-tc]").forEach(el=>el.addEventListener("click",()=>{
    mapSelectedTc=el.dataset.tc||"";
    mapSelectedStore="";
    mapMode="coverage";
    mapMetroOpen=true;
    renderMapPanel();
    setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:"smooth",block:"start"}),100);
  }));
}
function renderMetroMap(){
  if(!els.metroMap) return;
  const open=mapMetroOpen&&Boolean(mapSelectedTc||mapSelectedStore);
  els.metroMap.classList.toggle("show",open);
  if(!open){els.metroMap.innerHTML="";return;}
  const md=getMapDataSafe();
  const store=md.stores.find(r=>r.name===mapSelectedStore);
  const tcName=mapSelectedTc||(store?.tc||"");
  const tc=md.logistics.find(r=>r.name===tcName);
  const allRows=tcName?md.coverage.filter(r=>r.tc===tcName):[];
  const metroRows=allRows.filter(r=>["서울","경기","인천"].includes(normalizeProvinceName(r.province)));
  const useMetro=metroRows.length>0;
  const rows=(useMetro?metroRows:allRows).slice().sort((a,b)=>processLocaleCompare(a.area,b.area));
  const activeProv=new Set(rows.map(r=>normalizeProvinceName(r.province)));
  const title=useMetro?"수도권 확대 보기":`${tcName||"선택 거점"} 관할 권역 상세`;
  const baseSvg=useMetro
    ? `<svg class="metro-base-svg" viewBox="0 0 100 100"><path class="metro-base-region ${activeProv.has("경기")?"active":""}" d="M20 12 L62 7 L89 27 L91 66 L71 91 L31 89 L10 62 L12 30Z"/><path class="metro-base-region ${activeProv.has("인천")?"active":""}" d="M8 39 L25 32 L31 58 L17 72 L5 61Z"/><path class="metro-base-region ${activeProv.has("서울")?"active":""}" d="M38 42 L62 39 L68 56 L50 66 L34 56Z"/><text class="metro-region-label" x="51" y="78">경기</text><text class="metro-region-label" x="17" y="55">인천</text><text class="metro-region-label" x="50" y="54">서울</text></svg>`
    : `<svg class="metro-base-svg" viewBox="0 0 100 100"><path class="metro-base-region active" d="M14 18 L48 7 L82 19 L92 49 L79 84 L49 94 L18 80 L7 48Z"/><text class="metro-region-label" x="50" y="48">${esc(tcName||"관할 권역")}</text><text class="metro-region-label" x="50" y="58">${esc(Array.from(activeProv).join(" · ")||"권역 입력 전")}</text></svg>`;
  const cells=rows.length?rows.map(r=>`<span class="metro-cell active">${esc(r.area)}</span>`).join(""):`<div class="metro-empty">관할 권역이 아직 등록되지 않았습니다.<br>지도_물류권역DB에 입력해 주세요.</div>`;
  els.metroMap.innerHTML=`<div class="metro-map-head"><div class="metro-map-title">${esc(title)}</div><button class="metro-map-close" type="button" aria-label="상세 닫기">×</button></div><div class="metro-canvas tc-detail">${baseSvg}<div class="metro-area-cloud">${cells}</div></div>`;
  const close=els.metroMap.querySelector(".metro-map-close");
  if(close) close.addEventListener("click",()=>{mapMetroOpen=false;renderMapPanel();});
}
function renderMapInfo(){
  if(!els.mapInfo) return;
  const md=getMapDataSafe();
  const store=md.stores.find(r=>r.name===mapSelectedStore);
  const tc=md.logistics.find(r=>r.name===mapSelectedTc);
  const row=store||tc;
  if(!row||!mapMetroOpen){ els.mapInfo.innerHTML=""; return; }
  const isStore=Boolean(store);
  const linked=isStore?[]:md.stores.filter(s=>s.tc===row.name).sort((a,b)=>processLocaleCompare(a.name,b.name));
  const coverage=isStore?[]:md.coverage.filter(r=>r.tc===row.name);
  const areaText=uniqueArray(coverage.map(r=>r.area).filter(Boolean)).slice(0,8).join(", ");
  const linkedChips=!isStore&&linked.length?`<div class="map-linked-stores"><div class="map-linked-title">연결 점포</div><div class="map-linked-chips">${linked.map(s=>`<button class="map-linked-chip" type="button" data-linked-store="${esc(s.name)}">${esc(s.name)}</button>`).join("")}</div></div>`:"";
  els.mapInfo.innerHTML=`<div class="map-info-card"><div class="map-info-head"><div><div><span class="map-info-title">${esc(row.name)}</span><span class="map-info-selected">선택됨</span></div><div class="map-info-phone">☎ ${esc(row.phone||"미등록")}</div></div></div>${!isStore?`<div class="map-linked-count-box"><span>연결 점포</span><strong>${linked.length}개</strong></div><div class="map-overlay-section"><div class="map-overlay-label">관할 지역</div><div class="map-overlay-value">${esc(areaText||"시트 입력 전")}${coverage.length>8?` 외 ${coverage.length-8}곳`:``}</div></div>`:`<div class="map-overlay-section"><div class="map-overlay-label">담당 물류</div><div class="map-overlay-value">${esc(row.tc||"미등록")}</div></div>`}<div class="map-overlay-section"><div class="map-overlay-label">주소</div><div class="map-overlay-value">${esc(row.address||"주소 입력 전")}</div></div>${linkedChips}<div class="map-actions"><button class="map-action copy" type="button" data-copy-address="${esc(row.address||"")}" ${row.address?"":"disabled"}>주소 복사</button></div></div>`;
  els.mapInfo.querySelectorAll("[data-copy-address]").forEach(btn=>btn.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(btn.dataset.copyAddress||"");btn.textContent="복사 완료";setTimeout(()=>btn.textContent="주소 복사",1200)}catch(e){}}));
  els.mapInfo.querySelectorAll("[data-linked-store]").forEach(btn=>btn.addEventListener("click",()=>{mapSelectedStore=btn.dataset.linkedStore||"";const st=md.stores.find(r=>r.name===mapSelectedStore);mapSelectedTc=st?.tc||mapSelectedTc;mapMode="store";mapMetroOpen=true;renderMapPanel();}));
}
function renderMapCoverageList(){
  if(!els.mapCoverageList) return;
  const md=getMapDataSafe();
  const tc=md.logistics.find(r=>r.name===mapSelectedTc);
  if(!tc||mapMode!=="coverage"||mapMetroOpen){els.mapCoverageList.innerHTML="";return;}
  const grouped={};
  md.coverage.filter(r=>r.tc===tc.name).forEach(r=>{const p=normalizeProvinceName(r.province)||"기타";(grouped[p]||(grouped[p]=[])).push(r);});
  els.mapCoverageList.innerHTML=Object.entries(grouped).map(([p,rows])=>`<div class="map-coverage-group"><div class="map-coverage-province">${esc(p)}</div><div class="map-area-chips">${rows.map(r=>`<span class="map-area-chip active">${esc(r.area)}</span>`).join("")}</div>${rows.some(r=>r.note)?`<div class="map-area-note">${esc(uniqueArray(rows.map(r=>r.note).filter(Boolean)).join(" · "))}</div>`:""}</div>`).join("");
}
function processLocaleCompare(a,b){
  return String(a||"").localeCompare(String(b||""), "ko", { numeric:true, sensitivity:"base" });
}

function processTypeIconSvg(type){
  const key = safe(type, "기타");
  if(key === "전체") return `<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="6" height="6" rx="1.4" stroke="currentColor" stroke-width="1.8"/><rect x="14" y="4" width="6" height="6" rx="1.4" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="14" width="6" height="6" rx="1.4" stroke="currentColor" stroke-width="1.8"/><rect x="14" y="14" width="6" height="6" rx="1.4" stroke="currentColor" stroke-width="1.8"/></svg>`;
  if(key.includes("시연")) return `<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="4.5" width="17" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="m10 8.5 5 2.5-5 2.5v-5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 20h6M12 16.5V20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  if(key.includes("배송")) return `<svg viewBox="0 0 24 24" fill="none"><path d="M3.5 6h10v10h-10V6Zm10 3h4l3 3v4h-7V9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18" r="2" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="18" r="2" stroke="currentColor" stroke-width="1.8"/></svg>`;
  if(key.includes("설치")) return `<svg viewBox="0 0 24 24" fill="none"><path d="m14.5 5.5 4 4-9.8 9.8a2.1 2.1 0 0 1-3 0l-1-1a2.1 2.1 0 0 1 0-3l9.8-9.8Z" stroke="currentColor" stroke-width="1.8"/><path d="m13 7 4 4M4 5l5 5M7 3 3 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  if(key.includes("VOC")) return `<svg viewBox="0 0 24 24" fill="none"><path d="M4 5.5h16v11H9l-5 3v-14Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="8" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="11" r="1" fill="currentColor"/><circle cx="16" cy="11" r="1" fill="currentColor"/></svg>`;
  if(key.includes("가전")) return `<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M5 8h14" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="14" r="4" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="5.8" r=".8" fill="currentColor"/></svg>`;
  return `<svg viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="18" cy="12" r="1.7" fill="currentColor"/></svg>`;
}

function getProcessTypes(){
  const preferred = ["시연 모드","배송","설치","VOC","가전제품","기타"];
  const counts = new Map();
  (DB.processes || []).forEach(row=>{
    const type = safe(row.type,"기타");
    counts.set(type, (counts.get(type)||0)+1);
  });
  const extras = Array.from(counts.keys()).filter(v=>!preferred.includes(v)).sort(processLocaleCompare);
  return ["전체", ...preferred.filter(v=>counts.has(v)), ...extras].map(type=>({
    type,
    count:type === "전체" ? (DB.processes||[]).length : (counts.get(type)||0)
  })).filter(row=>row.count > 0);
}

function processTypeDescription(type){
  const map = {
    "전체":"등록된 전체 업무 절차",
    "시연 모드":"매장 시연과 진열 관련 절차",
    "배송":"배송 일정과 인계 관련 절차",
    "설치":"제품 설치와 철거 관련 절차",
    "VOC":"회원 불편과 요청 처리 절차",
    "가전제품":"제품별 확인이 필요한 절차",
    "기타":"그 외 업무 처리 절차"
  };
  return map[type] || `${type} 관련 업무 절차`;
}

function matchProcesses(query, typeFilter="전체"){
  const q = normalizeText(query);
  let rows = (DB.processes || []).map((row,index)=>({ ...row, _dbIndex:index }));
  if(typeFilter && typeFilter !== "전체") rows = rows.filter(row=>safe(row.type,"기타") === typeFilter);
  if(!q) return rows.sort((a,b)=>processLocaleCompare(a.title,b.title));
  return rows.map(row=>{
    const title = normalizeText(row.title);
    const body = normalizeText(row.fullText || row.body || row.summary);
    let rank = 99;
    if(title.startsWith(q)) rank = 0;
    else if(title.includes(q)) rank = 1;
    else if(body.includes(q)) rank = 2;
    return { ...row, _rank:rank };
  }).filter(row=>row._rank < 99).sort((a,b)=>a._rank-b._rank || processLocaleCompare(a.title,b.title));
}

function renderProcessRecommendations(){
  const terms = Array.isArray(DB.processRecommendations) ? DB.processRecommendations.filter(Boolean).slice(0,8) : [];
  if(!els.processRecommendSection || !els.processRecommendChips) return;
  if(!terms.length){
    els.processRecommendSection.classList.remove("show");
    els.processRecommendChips.innerHTML = "";
    return;
  }
  els.processRecommendSection.classList.add("show");
  els.processRecommendChips.innerHTML = terms.map(term=>`<button class="process-recommend-chip" type="button" data-term="${esc(term)}">${esc(term)}</button>`).join("");
  els.processRecommendChips.querySelectorAll(".process-recommend-chip").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const term = btn.dataset.term || "";
      els.processSearch.value = term;
      processFilter = "전체";
      hideProcessSuggestions();
      pushProcessHistory("results");
      const rows = renderProcessCurrentView(false);
      queueProcessSearchLog(term, rows.length, "", "추천 검색어");
    });
  });
}

function renderProcessTypes(){
  if(!els.processTypeList) return;
  const types = getProcessTypes();
  els.processTypeList.innerHTML = types.map(({type,count})=>`<button class="process-type-row" type="button" data-type="${esc(type)}">
    <span class="process-type-icon">${processTypeIconSvg(type)}</span>
    <span class="process-type-text"><span class="process-type-name">${esc(type === "전체" ? "전체 프로세스" : type)}</span><span class="process-type-desc">${esc(processTypeDescription(type))}</span></span>
    <span class="process-type-count">${count}건</span><span class="process-type-arrow">›</span>
  </button>`).join("");
  els.processTypeList.querySelectorAll(".process-type-row").forEach(btn=>{
    btn.addEventListener("click",()=>{
      processFilter = btn.dataset.type || "전체";
      els.processSearch.value = "";
      hideProcessSuggestions();
      pushProcessHistory("results");
      renderProcessCurrentView(false);
    });
  });
}

function renderProcessSuggestions(){
  if(!els.processSuggest || !els.processSearch) return;
  const raw = els.processSearch.value.trim();
  if(!raw){ hideProcessSuggestions(); return; }
  processSuggestions = matchProcesses(raw, "전체").slice(0,8);
  if(!processSuggestions.length){ hideProcessSuggestions(); return; }
  els.processSuggest.innerHTML = processSuggestions.map(row=>`<button class="process-suggest-btn" type="button" data-index="${row._dbIndex}" role="option"><span class="process-suggest-title">${esc(row.title || "제목 미등록")}</span><span class="process-suggest-type">${esc(row.type || "기타")}</span></button>`).join("");
  els.processSuggest.classList.add("show");
  processSuggestionOpen = true;
  els.processSuggest.querySelectorAll(".process-suggest-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const idx = Number(btn.dataset.index);
      const row = (DB.processes || [])[idx];
      if(!row) return;
      const typed = els.processSearch.value.trim();
      els.processSearch.value = row.title || typed;
      processFilter = "전체";
      hideProcessSuggestions();
      pushProcessHistory("results");
      const rows = renderProcessCurrentView(false);
      queueProcessSearchLog(typed || row.title, rows.length, row.title || "", "자동완성 선택");
      openProcessDetail(row);
    });
  });
}

function hideProcessSuggestions(){
  if(els.processSuggest){ els.processSuggest.classList.remove("show"); els.processSuggest.innerHTML = ""; }
  processSuggestionOpen = false;
}

function runProcessSearch(action="검색"){
  const term = els.processSearch ? els.processSearch.value.trim() : "";
  if(!term){
    resetProcessView(true);
    renderProcessCurrentView(false);
    return;
  }
  processFilter = "전체";
  hideProcessSuggestions();
  pushProcessHistory("results");
  const rows = renderProcessCurrentView(false);
  queueProcessSearchLog(term, rows.length, "", action);
}

function renderProcessCurrentView(showSuggestions=false){
  if(els.processCountPill) els.processCountPill.textContent = `${(DB.processes||[]).length}건`;
  renderProcessRecommendations();
  renderProcessTypes();

  const detailMode = processViewMode === "detail" && processDetailRow;
  if(els.processPageHeading) els.processPageHeading.style.display = detailMode ? "none" : "flex";
  if(els.processSearchWrap) els.processSearchWrap.style.display = detailMode ? "none" : "block";

  if(detailMode){
    if(els.processRecommendSection) els.processRecommendSection.classList.remove("show");
    if(els.processTypeSection) els.processTypeSection.classList.remove("show");
    if(els.processResultSection) els.processResultSection.classList.remove("show");
    if(els.processDetailSection) els.processDetailSection.classList.add("show");
    renderProcessDetail(processDetailRow);
    hideProcessSuggestions();
    return [processDetailRow];
  }

  const raw = els.processSearch ? els.processSearch.value.trim() : "";
  const searching = Boolean(raw);
  const typeSelected = !searching && processFilter !== "전체";
  const rows = searching ? matchProcesses(raw,"전체") : (typeSelected ? matchProcesses("",processFilter) : []);
  processViewMode = (searching || typeSelected) ? "results" : "home";
  processHistoryView = processViewMode;
  if(els.processDetailSection) els.processDetailSection.classList.remove("show");
  if(els.processTypeSection) els.processTypeSection.classList.toggle("show", processViewMode === "home");
  if(els.processRecommendSection) els.processRecommendSection.classList.toggle("show", processViewMode === "home" && (DB.processRecommendations||[]).length > 0);
  if(els.processResultSection) els.processResultSection.classList.toggle("show", processViewMode === "results");

  if(processViewMode === "results"){
    if(els.processResultTitle) els.processResultTitle.textContent = searching ? `“${raw}” 검색 결과` : `${processFilter} 프로세스`;
    if(els.processResultCount) els.processResultCount.textContent = `${rows.length}건`;
    renderProcesses(rows);
  }else if(els.processList){
    els.processList.innerHTML = "";
  }

  if(showSuggestions && searching) renderProcessSuggestions();
  else if(!searching) hideProcessSuggestions();
  return rows;
}

function renderProcessScreen(showSuggestions=false){
  return renderProcessCurrentView(showSuggestions);
}

function processSnippet(row){
  const text = String((row && (row.summary || row.body || row.fullText)) || "").replace(/\s+/g," ").trim();
  return text || "눌러서 상세 절차를 확인하세요.";
}

function renderProcesses(rowsArg){
  const rows = Array.isArray(rowsArg) ? rowsArg : [];
  if(!els.processList) return;
  if(!rows.length){
    els.processList.innerHTML = `<div class="process-no-result">검색 조건에 맞는 프로세스가 없습니다.<br>다른 글자로 다시 검색해 주세요.</div>`;
    return;
  }
  els.processList.innerHTML = rows.map(row=>{
    const favoriteKey = processFavoriteKey(row);
    return `<div class="info-card process-card" data-process-index="${row._dbIndex}">
      <button class="process-question" type="button">
        <div class="process-question-row">
          <div class="process-card-main"><span class="process-card-icon">${processTypeIconSvg(row.type)}</span><span class="process-card-copy"><span class="info-title">${styledText(row.title,"제목 미등록",styleOf(row,"title"))}</span><span class="process-card-snippet">${esc(processSnippet(row))}</span></span></div>
          <div class="process-card-side"><span class="pill type-chip">${styledText(row.type,"기타",styleOf(row,"type"))}</span><span class="process-card-chevron">›</span></div>
        </div>
      </button>
      ${contentFavoriteStarButton("process",favoriteKey,"process-card-star")}
    </div>`;
  }).join("");

  els.processList.querySelectorAll(".process-card").forEach(card=>{
    const idx = Number(card.dataset.processIndex);
    const row = (DB.processes || [])[idx];
    const btn = card.querySelector(".process-question");
    if(!btn || !row) return;
    btn.addEventListener("click",()=>openProcessDetail(row));
  });
  bindContentFavoriteButtons(els.processList);
}

function baseTextStyle(style){
  if(!style || typeof style !== "object") return null;
  const out = {};
  ["color","fontSize","fontWeight","fontStyle","textDecoration"].forEach(key=>{ if(style[key]) out[key]=style[key]; });
  return Object.keys(out).length ? out : null;
}

function sliceRichStyle(style,start,end){
  if(!style || !Array.isArray(style.__rich)) return baseTextStyle(style);
  const parts = [];
  let offset = 0;
  style.__rich.forEach(seg=>{
    const raw = String(seg && seg.text ? seg.text : "");
    const segStart = offset;
    const segEnd = offset + raw.length;
    const from = Math.max(start,segStart);
    const to = Math.min(end,segEnd);
    if(from < to) parts.push({ text:raw.slice(from-segStart,to-segStart), style:seg && seg.style ? seg.style : null });
    offset = segEnd;
  });
  const out = baseTextStyle(style) || {};
  if(parts.length) out.__rich = parts;
  return Object.keys(out).length ? out : null;
}

function parseProcessStep(item, idx){
  const rawText = String(item && typeof item === "object" ? item.text || "" : item || "");
  const text = rawText.trim();
  const style = item && typeof item === "object" ? item.style || null : null;
  const images = item && typeof item === "object" ? processImageValues(item.images || item.imageUrls || item.imageUrl) : [];
  if(!text && !images.length) return null;
  const lineBreak = text.indexOf("\n");
  if(lineBreak < 0) return { num:idx, title:`${idx}번`, body:text, titleStyle:null, bodyStyle:style, images };
  const title = text.slice(0,lineBreak).trim() || `${idx}번`;
  const bodyStart = lineBreak + 1;
  const body = text.slice(bodyStart).trim();
  return { num:idx, title, body, titleStyle:sliceRichStyle(style,0,lineBreak), bodyStyle:sliceRichStyle(style,bodyStart,text.length), images };
}

function processImageValues(value){
  const rawList = Array.isArray(value) ? value : String(value || "").split(/[\r\n,|;]/);
  const out = [];
  rawList.forEach(entry=>{
    const raw = String(entry || "").trim();
    if(!raw) return;
    const url = resolveProcessImageUrl(raw);
    if(url && !out.includes(url)) out.push(url);
  });
  return out;
}

function resolveProcessImageUrl(value){
  const raw = String(value || "").trim();
  if(!raw) return "";
  if(/^(https?:)?\/\//i.test(raw) || /^(data|blob):/i.test(raw)) return raw;
  let path = raw.replace(/\\/g,"/").replace(/^\.\//,"");
  if(path.startsWith("/")) path = path.slice(1);
  if(!path.startsWith("images/") && !path.startsWith("../")){
    path = String(CONFIG.PROCESS_IMAGE_BASE_PATH || "./images/process/").replace(/^\.\//,"") + path;
  }
  const encodedPath = path.split("/").map(part=>{
    if(!part || part === "." || part === "..") return part;
    try{return encodeURIComponent(decodeURIComponent(part));}catch(err){return encodeURIComponent(part);}
  }).join("/");
  let url = "";
  try{ url = new URL(encodedPath, document.baseURI).href; }
  catch(err){ url = encodedPath; }
  const bust = encodeURIComponent((DB && DB.updateVersion) || CONFIG.APP_VERSION || "v129");
  return url + (url.includes("?") ? "&" : "?") + "v=" + bust;
}

function processImageFallbackUrl(url){
  try{
    const parsed = new URL(url, document.baseURI);
    const marker = "/images/process/";
    const idx = parsed.pathname.indexOf(marker);
    if(idx < 0) return "";
    const filePath = parsed.pathname.slice(idx + marker.length).split("/").map(part=>{
      try{return encodeURIComponent(decodeURIComponent(part));}catch(err){return encodeURIComponent(part);}
    }).join("/");
    return String(CONFIG.PROCESS_IMAGE_RAW_BASE || "") + filePath + "?v=" + encodeURIComponent(CONFIG.APP_VERSION || "v129");
  }catch(err){ return ""; }
}

function processImagesHtml(value, altText="프로세스 이미지", className=""){
  const urls = processImageValues(value);
  if(!urls.length) return "";
  const one = urls.length === 1 ? " single" : "";
  return `<div class="process-detail-images${one}${className ? ` ${className}` : ""}">${urls.map((url,index)=>{const fallback=processImageFallbackUrl(url);return `<div class="process-detail-image-frame"><img class="process-img" src="${esc(url)}" data-fallback="${esc(fallback)}" alt="${esc(altText)}${urls.length>1 ? ` ${index+1}` : ""}" loading="lazy" decoding="async"><span class="process-detail-image-hint">확대</span></div>`;}).join("")}</div>`;
}

function bindProcessDetailImages(){
  if(!els.processDetailView) return;
  const images = Array.from(els.processDetailView.querySelectorAll(".process-img"));
  images.forEach(img=>{
    img.addEventListener("error",()=>{
      const fallback = String(img.dataset.fallback || "").trim();
      if(fallback && img.dataset.fallbackTried !== "1" && img.src !== fallback){
        img.dataset.fallbackTried = "1";
        img.src = fallback;
        return;
      }
      const frame=img.closest(".process-detail-image-frame");
      if(frame) frame.remove();
    });
    img.addEventListener("click",()=>{
      const visible = Array.from(els.processDetailView.querySelectorAll(".process-img")).filter(node=>node.closest(".process-detail-image-frame"));
      const urls = visible.map(node=>node.currentSrc || node.src).filter(Boolean);
      const index = Math.max(0, visible.indexOf(img));
      openImageModal(urls,index,img.alt || "프로세스 이미지 확대");
    });
  });
}

function processRowHasImages(row){
  if(!row || typeof row !== "object") return false;
  if(processImageValues(row.heroImages || row.imageUrls || row.imageUrl).length) return true;
  if(processImageValues(row.summaryImages).length || processImageValues(row.cautionImages).length) return true;
  return (Array.isArray(row.steps) ? row.steps : []).some(step=>processImageValues(step && typeof step === "object" ? (step.images || step.imageUrls || step.imageUrl) : "").length);
}

const processImageLiveRefreshKeys = new Set();
async function ensureProcessImagesForDetail(row){
  if(!row || processRowHasImages(row) || !navigator.onLine) return;
  const key = `${normalizeText(row.type)}|${normalizeText(row.title)}`;
  if(!key || processImageLiveRefreshKeys.has(key)) return;
  processImageLiveRefreshKeys.add(key);
  try{
    const data = await apiGet({action:"processes", _:Date.now()});
    if(!data || data.ok === false || !Array.isArray(data.processes)) return;
    const found = data.processes.find(item=>normalizeText(item.type)===normalizeText(row.type) && normalizeText(item.title)===normalizeText(row.title));
    if(!found || !processRowHasImages(found)) return;
    const idx = (DB.processes || []).findIndex(item=>normalizeText(item.type)===normalizeText(row.type) && normalizeText(item.title)===normalizeText(row.title));
    if(idx >= 0) DB.processes[idx] = found;
    processDetailRow = found;
    saveDbCacheSafely(DB,Date.now());
    renderProcessDetail(found);
  }catch(err){ console.warn("process image live refresh failed",err); }
}

function openProcessDetail(row){
  if(!row) return;
  processDetailReturn = { mode:processViewMode || "home", query:els.processSearch ? els.processSearch.value.trim() : "", filter:processFilter || "전체" };
  processDetailRow = row;
  processViewMode = "detail";
  pushProcessHistory("detail");
  queueViewLog("프로세스", [safe(row.type,""), safe(row.title,"")].filter(Boolean).join(" · "), "");
  addRecentView({ type:"process", id:`process:${row.type || ''}:${row.title || row._dbIndex || ''}`, title:row.title || "프로세스", subtitle:row.type || "프로세스" });
  const typed = els.processSearch ? els.processSearch.value.trim() : "";
  const currentRows = matchProcesses(typed, typed ? "전체" : processFilter);
  queueProcessSearchLog(typed || row.title, currentRows.length || 1, row.title || "", "프로세스 열기");
  renderProcessCurrentView(false);
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderProcessDetail(row){
  if(!els.processDetailView || !row) return;
  const type = safe(row.type,"기타");
  const rawSteps = Array.isArray(row.steps) ? row.steps : [];
  const steps = rawSteps.map((v,i)=>{
    if(v && typeof v === "object" && !processImageValues(v.images || v.imageUrls || v.imageUrl).length){
      const fallbackImages = row[`step${i+1}Images`] || (Array.isArray(row.stepImages) ? row.stepImages[i] : null) || row[`${i+1}번이미지`] || row[`${i+1}번 이미지`];
      if(fallbackImages) v = {...v, images:fallbackImages};
    }
    return parseProcessStep(v,i+1);
  }).filter(Boolean).slice(0,5);
  const summary = safe(row.summary || row.body, "내용 미등록");
  const caution = safe(row.caution, "");
  const chipSvg = processTypeIconSvg(type);
  const heroImagesHtml = processImagesHtml(row.heroImages || row.imageUrls || row.imageUrl, `${row.title || "프로세스"} 대표 이미지`, "process-hero-images");
  const summaryImagesHtml = processImagesHtml(row.summaryImages, `${row.title || "프로세스"} 핵심 이미지`, "process-summary-images");
  const cautionImagesHtml = processImagesHtml(row.cautionImages, `${row.title || "프로세스"} 주의사항 이미지`, "process-caution-images");
  const stepsHtml = steps.length ? steps.map(step=>`<div class="process-detail-step"><div class="process-detail-step-num">${step.num}</div><div class="process-detail-copy"><div class="process-detail-step-title">${styledText(step.title,"",step.titleStyle)}</div>${step.body ? `<div class="process-detail-step-body">${styledText(step.body,"",step.bodyStyle)}</div>` : ``}${processImagesHtml(step.images, `${step.title || `${step.num}번`} 이미지`, "process-step-images")}</div></div>`).join("") : `<div class="process-no-result">등록된 답변 단계가 없습니다.</div>`;
  const favoriteKey = processFavoriteKey(row);
  els.processDetailView.innerHTML = `
    <div class="process-detail-hero">
      <div class="process-detail-topline"><span class="process-detail-chip">${chipSvg}${esc(type)}</span>${contentFavoriteStarButton("process",favoriteKey,"process-detail-star")}</div>
      <div class="process-detail-title-row"><div class="process-detail-title">${styledText(row.title,"제목 미등록",styleOf(row,"title"))}</div><span class="process-detail-searchbadge"><svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="m16.5 16.5 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span></div>
      ${heroImagesHtml}
    </div>
    <div class="process-detail-hero process-detail-summary"><div class="process-detail-summary-icon">📋</div><div class="process-detail-copy"><div class="process-detail-summary-title">핵심 요약</div><div class="process-detail-summary-body">${styledText(summary,"",styleOf(row,"summary"))}</div>${summaryImagesHtml}</div></div>
    <div class="process-detail-card"><div class="process-detail-card-head"><span class="process-detail-check">✓</span><span class="title">답변</span></div>${stepsHtml}</div>
    ${(caution || cautionImagesHtml) ? `<div class="process-detail-caution"><div class="process-detail-caution-icon">⚠️</div><div class="process-detail-copy"><div class="process-detail-caution-title">주의 사항</div>${caution ? `<div class="process-detail-caution-body">${styledText(caution,"",styleOf(row,"caution"))}</div>` : ``}${cautionImagesHtml}</div></div>` : ``}
  `;
  bindContentFavoriteButtons(els.processDetailView);
  bindProcessDetailImages();
  setTimeout(()=>ensureProcessImagesForDetail(row),0);
}

function compressProcessRecommendationTerm(term){
  const raw = String(term||"").trim().replace(/\s+/g," ");
  if(!raw) return "";
  if(raw.length <= 12 && !/[?？]/.test(raw)) return raw;
  const stop = new Set(["언제까지","가능한가요","가능","회원","회원이","경우","어떻게","되나요","프로세스","절차","관련","문의","확인","해주세요","이후","매장","발생","했을"]);
  const tokens = raw.replace(/["“”'‘’?？!！.,·()\[\]{}]/g," ").split(/\s+/).map(v=>v.replace(/(은|는|이|가|을|를|와|과|에|의|로|으로|도|만|까지|부터)$/,"")) .filter(Boolean).filter(v=>!/^\d+시$/.test(v) && !stop.has(v));
  const picked = [];
  tokens.forEach(v=>{ if(!picked.includes(v) && picked.length<3) picked.push(v); });
  return (picked.join(" ") || raw).slice(0,12);
}


function queueProcessSearchLog(term,resultCount=0,selectedProcess="",action="검색"){
  const cleanTerm = String(term || "").trim().replace(/\s+/g," ").slice(0,80);
  const cleanSelected = String(selectedProcess || "").trim().replace(/\s+/g," ").slice(0,160);
  if(!cleanTerm && !cleanSelected) return;
  const key = `${normalizeText(cleanTerm)}|${normalizeText(cleanSelected)}|${action}`;
  const now = Date.now();
  const prev = processSearchLogTimes.get(key) || 0;
  if(now - prev < 1800) return;
  processSearchLogTimes.set(key,now);
  const qs = new URLSearchParams({ action:"logProcessSearch", term:cleanTerm, resultCount:String(Math.max(0,Number(resultCount)||0)), selectedProcess:cleanSelected, source:String(action||"검색").slice(0,30), _:String(now) }).toString();
  const url = `${CONFIG.APPS_SCRIPT_URL}?${qs}`;
  try{ fetch(url,{ method:"GET",mode:"no-cors",cache:"no-store",keepalive:true }).catch(()=>{}); }
  catch(e){ try{ const img = new Image(); img.src = url; }catch(err){} }
  if(cleanSelected && cleanSelected.length >= 2) addProcessRecommendationOptimistic(cleanSelected);
  else if(cleanTerm.length >= 2 && Number(resultCount)>0) addProcessRecommendationOptimistic(cleanTerm);
  setTimeout(()=>fetchProcessRecommendations(true),1400);
}

function addProcessRecommendationOptimistic(term){
  const clean = compressProcessRecommendationTerm(term);
  if(clean.length < 2) return;
  const current = Array.isArray(DB.processRecommendations) ? DB.processRecommendations : [];
  DB.processRecommendations = [clean, ...current.filter(v=>normalizeText(v)!==normalizeText(clean))].slice(0,8);
  renderProcessRecommendations();
}

async function fetchProcessRecommendations(force=false){
  if(processRecommendationLoading) return;
  const now = Date.now();
  if(!force && now - processRecommendationLoadedAt < 60000){ renderProcessRecommendations(); return; }
  processRecommendationLoading = true;
  try{
    const data = await apiGet({ action:"processRecommendations", _:now });
    if(data && data.ok !== false && Array.isArray(data.recommendations)){
      DB.processRecommendations = data.recommendations.filter(Boolean).slice(0,8);
      processRecommendationLoadedAt = Date.now();
      renderProcessRecommendations();
    }
  }catch(e){}finally{ processRecommendationLoading = false; }
}

function openImageModal(images, startIndex=0, caption="이미지 확대 보기"){
  const list = Array.isArray(images) ? images.filter(Boolean) : [images].filter(Boolean);
  if(!list.length) return;
  modalImageUrls = list;
  modalImageIndex = Math.max(0, Math.min(Number(startIndex) || 0, list.length-1));
  modalCaptionBase = caption || "이미지 확대 보기";
  renderModalImage();
  els.imageModal.classList.add("show");
  els.imageModal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
  if(!modalHistoryPushed){
    try{ history.pushState({hubOverlay:"image", hubPage:currentPage, hubTrail:appBackStack.slice(), t:Date.now()}, "", getCleanAppUrl() + "#image"); modalHistoryPushed = true; }catch(err){}
  }
}

function renderModalImage(){
  if(!modalImageUrls.length) return;
  const src = modalImageUrls[modalImageIndex];
  els.imageModalImg.src = src;
  const countText = modalImageUrls.length > 1 ? ` (${modalImageIndex+1}/${modalImageUrls.length})` : "";
  els.imageModalCaption.textContent = `${modalCaptionBase}${countText}`;
  els.imageModalPrev.style.display = "none";
  els.imageModalNext.style.display = "none";
}

function moveModalImage(step){
  if(modalImageUrls.length < 2) return;
  const next = Math.max(0, Math.min(modalImageIndex + step, modalImageUrls.length - 1));
  if(next === modalImageIndex) return;
  modalImageIndex = next;
  renderModalImage();
}

function closeImageModal(fromPop=false){
  if(!fromPop && modalHistoryPushed){
    try{ history.back(); return; }catch(err){}
  }
  modalHistoryPushed = false;
  els.imageModal.classList.remove("show");
  els.imageModal.setAttribute("aria-hidden","true");
  els.imageModalImg.removeAttribute("src");
  modalImageUrls = [];
  if(!els.specViewer.classList.contains("show")) document.body.style.overflow = "";
}


function getCleanAppUrl(){
  return location.pathname + location.search;
}

function pushSpecHistory(){
  try{
    const clean = getCleanAppUrl();
    history.pushState({hubOverlay:"spec", hubPage:currentPage, hubTrail:appBackStack.slice(), t:Date.now()}, "", clean + "#spec");
    specHistoryPushed = true;
  }catch(err){
    specHistoryPushed = false;
  }
}

function clearOverlayUrl(){
  replaceCurrentRouteState();
}

function getConfiguredSpecImageUrls(item){
  if(!item) return [];
  const raw = [];
  if(Array.isArray(item.specImageUrls)) raw.push(...item.specImageUrls);
  raw.push(item.specImageUrl, item.specImageUrl2, item.specImageUrl3);

  // 이전 버전 호환: 스펙 칸에 URL을 넣어둔 경우도 인식
  raw.push(item.spec);

  return uniqueArray(raw
    .flatMap(splitImageUrls)
    .map(convertDriveImageUrl)
    .filter(looksLikeImageUrl)
    .map(cacheBustImageUrl));
}

function getSpecItemNo(item){
  return safe(item?.itemNo, "").replace(/[^0-9A-Za-z_-]/g, "");
}

function getSpecImageExtensions(){
  if(Array.isArray(CONFIG.SPEC_IMAGE_EXTENSIONS) && CONFIG.SPEC_IMAGE_EXTENSIONS.length){
    return CONFIG.SPEC_IMAGE_EXTENSIONS.map(v=>String(v).replace(/^\./,"").toLowerCase()).filter(Boolean);
  }
  return [String(CONFIG.SPEC_IMAGE_EXT || "png").replace(/^\./,"").toLowerCase()];
}

function cacheBustImageUrl(url){
  const text = String(url || "").trim();
  if(!text || text.startsWith("data:image/")) return text;
  const token = CONFIG.SPEC_IMAGE_CACHE_BUST || Date.now();
  return text + (text.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(token);
}

function rawSpecImageUrl(fileName){
  const base = CONFIG.SPEC_IMAGE_RAW_BASE || "";
  if(!base) return "";
  return cacheBustImageUrl(base + encodeURIComponent(fileName).replace(/%2F/g,"/"));
}

function localSpecImageUrl(fileName){
  const base = CONFIG.SPEC_IMAGE_BASE_PATH || "./images/";
  return cacheBustImageUrl(base + fileName);
}

async function fetchGithubSpecImageUrls(item){
  const itemNo = getSpecItemNo(item);
  if(!itemNo || !CONFIG.SPEC_IMAGE_GITHUB_API) return [];
  try{
    const res = await fetch(CONFIG.SPEC_IMAGE_GITHUB_API + "&t=" + Date.now(), { cache:"no-store" });
    if(!res.ok) return [];
    const files = await res.json();
    if(!Array.isArray(files)) return [];
    const exts = getSpecImageExtensions().join("|");
    const re = new RegExp("^" + itemNo.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "[_-](\\d+)\\.(" + exts + ")$", "i");
    return files
      .map(f=>{
        const name = String(f?.name || "").trim();
        const m = name.match(re);
        if(!m) return null;
        return {
          no: Number(m[1]),
          url: cacheBustImageUrl(f.download_url || rawSpecImageUrl(name))
        };
      })
      .filter(v=>v && v.url)
      .sort((a,b)=>a.no-b.no)
      .map(v=>v.url);
  }catch(err){
    return [];
  }
}

function getAutoSpecImageCandidateGroups(item){
  const itemNo = getSpecItemNo(item);
  if(!itemNo) return [];
  const max = Number(CONFIG.SPEC_IMAGE_MAX_COUNT || 10);
  const exts = getSpecImageExtensions();

  return Array.from({length:max}, (_,i)=>{
    const n = i + 1;
    const group = [];
    exts.forEach(ext=>{
      const fileName = `${itemNo}_${n}.${ext}`;
      group.push(localSpecImageUrl(fileName));
      const raw = rawSpecImageUrl(fileName);
      if(raw) group.push(raw);
    });
    return uniqueArray(group);
  });
}

async function firstExistingImage(urls){
  for(const url of urls){
    const ok = await imageExists(url);
    if(ok) return url;
  }
  return "";
}

async function resolveSpecImageUrls(item){
  const explicit = getConfiguredSpecImageUrls(item);
  if(explicit.length) return explicit;

  // 1순위: GitHub API로 images 폴더 실제 파일 목록을 읽어서 찾음
  const githubUrls = await fetchGithubSpecImageUrls(item);
  if(githubUrls.length) return githubUrls;

  // 2순위: API가 막히거나 지연될 때 기존 파일명 규칙으로 직접 확인
  const groups = getAutoSpecImageCandidateGroups(item);
  const checked = [];
  for(const group of groups){
    const found = await firstExistingImage(group);
    if(found) checked.push(found);
  }
  return checked;
}

function imageExists(url){
  return new Promise(resolve=>{
    const img = new Image();
    const timer = setTimeout(()=>{ img.onload = img.onerror = null; resolve(false); }, 5000);
    img.onload = ()=>{ clearTimeout(timer); resolve(true); };
    img.onerror = ()=>{ clearTimeout(timer); resolve(false); };
    img.src = url;
  });
}

function looksLikeImageUrl(url){
  const text = String(url || "").trim();
  if(!text) return false;
  if(text.includes("drive.google.com/uc?export=view&id=")) return true;
  return /^(https?:\/\/|\.\/|\/|data:image\/)/i.test(text) && /(\.png|\.jpg|\.jpeg|\.webp|\.gif)(\?|#|$)/i.test(text);
}

function openSpecImageZoom(index){
  if(!specViewerUrls.length) return;
  const next = Math.max(0, Math.min(Number(index) || 0, specViewerUrls.length - 1));
  openImageModal(specViewerUrls, next, specViewerCaption || safe(selectedItem?.modelName,"상세 스펙"));
}


function getFeatureReferenceNotes(item){
  const notes = Array.isArray(item?.featureReferenceNotes) ? item.featureReferenceNotes : [];
  const cleaned = notes.map(v=>safe(v, ""));
  const fallback = safe(item?.referenceNote || item?.featureWrite || item?.featureNote || item?.featureDetail || item?.feature, "");
  if(cleaned.some(Boolean)) return cleaned;
  return fallback ? [fallback] : [];
}

function getFeatureReferenceText(item, index=0){
  const notes = getFeatureReferenceNotes(item);
  const i = Math.max(0, Number(index) || 0);
  return safe(notes[i] || notes[0] || "", "");
}

function getFeatureReferenceStyle(item, index=0){
  const styles = Array.isArray(item?.featureReferenceNoteStyles) ? item.featureReferenceNoteStyles : [];
  const i = Math.max(0, Number(index) || 0);
  return styles[i] || styles[0] || styleOf(item, "referenceNote") || styleOf(item, "featureWrite") || styleOf(item, "feature") || null;
}

function renderFeatureReferenceCard(item, index=0, total=0){
  const i = Math.max(0, Number(index) || 0);
  const body = getFeatureReferenceText(item, i);
  const bodyStyle = getFeatureReferenceStyle(item, i);
  const badge = total > 1 ? `${i+1}번 이미지` : "구글시트 수정";
  return `
    <div class="spec-write-card">
      <div class="spec-write-title">참조 내용 <span class="spec-write-badge">${esc(badge)}</span></div>
      <div class="spec-write-body ${body ? "" : "spec-write-empty"}">${body ? styledText(body, "", bodyStyle) : "등록된 참조 내용이 없습니다."}</div>
    </div>`;
}

function getFeatureImageUrlsFromSheet(item){
  if(!item) return [];
  const raw = [];
  if(Array.isArray(item.featureImageUrls)) raw.push(...item.featureImageUrls);
  raw.push(item.featureImageUrl, item.featureImageUrl2, item.featureImageUrl3);
  return uniqueArray(raw.flatMap(splitImageUrls));
}

async function fetchGithubFeatureImageUrls(item){
  const itemNo = getSpecItemNo(item);
  if(!itemNo || !CONFIG.SPEC_IMAGE_GITHUB_API) return [];
  try{
    const res = await fetch(CONFIG.SPEC_IMAGE_GITHUB_API + "&t=" + Date.now(), { cache:"no-store" });
    if(!res.ok) return [];
    const files = await res.json();
    if(!Array.isArray(files)) return [];
    const exts = getSpecImageExtensions().join("|");
    const re = new RegExp("^" + itemNo.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "[_-](feature|func)[_-](\\d+)\\.(" + exts + ")$", "i");
    return files
      .map(f=>{
        const name = String(f?.name || "").trim();
        const m = name.match(re);
        if(!m) return null;
        return { no:Number(m[2]), url:cacheBustImageUrl(f.download_url || rawSpecImageUrl(name)) };
      })
      .filter(v=>v && v.url)
      .sort((a,b)=>a.no-b.no)
      .map(v=>v.url);
  }catch(err){
    return [];
  }
}

async function firstExistingImageFast(urls, timeout=1100){
  for(const url of urls){
    const ok = await imageExistsWithTimeout(url, timeout);
    if(ok) return url;
  }
  return "";
}

function getFeatureImageNoFromUrl(url){
  const clean = decodeURIComponent(String(url || "")).split(/[?#]/)[0];
  const m = clean.match(/[_-](?:feature|func)[_-](\d+)\.(?:png|jpe?g|webp|gif)$/i);
  return m ? Number(m[1]) : 0;
}

function mergeFeatureImageSources(localEntries, githubUrls, fallbackEntries){
  const byNo = new Map();
  const extras = [];

  const add = (value, preferredNo=0)=>{
    const url = typeof value === "string" ? value : safe(value?.url, "");
    const no = Number(preferredNo || value?.no || getFeatureImageNoFromUrl(url));
    if(!url) return;
    if(no > 0){
      if(!byNo.has(no)) byNo.set(no, url);
    }else if(!extras.includes(url)){
      extras.push(url);
    }
  };

  (localEntries || []).forEach(v=>add(v, v?.no));
  (githubUrls || []).forEach(v=>add(v));
  (fallbackEntries || []).forEach(v=>add(v, v?.no));

  return Array.from(byNo.entries())
    .sort((a,b)=>a[0]-b[0])
    .map(([,url])=>url)
    .concat(extras);
}

async function resolveFeatureImageUrls(item){
  const cacheKey = getSpecItemNo(item) || safe(item?.modelName, "");
  if(cacheKey && featureImageUrlCache.has(cacheKey)) return featureImageUrlCache.get(cacheKey);

  const fromSheet = getFeatureImageUrlsFromSheet(item);
  if(fromSheet.length){
    if(cacheKey) featureImageUrlCache.set(cacheKey, fromSheet);
    return fromSheet;
  }

  const itemNo = getSpecItemNo(item);
  if(!itemNo) return [];
  const max = Number(CONFIG.SPEC_IMAGE_MAX_COUNT || 10);
  const exts = getSpecImageExtensions();

  // v136: 같은 주소에서 정상 열리는 이미지가 네트워크 지연 때문에 누락되지 않도록
  // 로컬 PNG 확인과 GitHub 실제 파일 목록 확인을 동시에 실행하고 번호별로 합칩니다.
  const localPngPromise = Promise.all(Array.from({length:max}, (_,i)=>{
    const no = i + 1;
    const url = localSpecImageUrl(`${itemNo}_feature_${no}.png`);
    return imageExistsWithTimeout(url, 2600).then(ok=> ok ? { no, url } : null);
  })).then(list=>list.filter(Boolean));

  const githubPromise = fetchGithubFeatureImageUrls(item);
  const [localEntries, githubUrls] = await Promise.all([localPngPromise, githubPromise]);
  let urls = mergeFeatureImageSources(localEntries, githubUrls, []);

  // GitHub API가 제한되거나 일부 파일만 확인된 경우, 빠진 번호만 로컬/Raw 주소에서 재확인합니다.
  const foundNos = new Set(urls.map(getFeatureImageNoFromUrl).filter(Boolean));
  const missingChecks = Array.from({length:max}, (_,i)=>{
    const no = i + 1;
    if(foundNos.has(no)) return Promise.resolve(null);
    const group = [];
    exts.forEach(ext=>{
      group.push(localSpecImageUrl(`${itemNo}_feature_${no}.${ext}`));
      group.push(localSpecImageUrl(`${itemNo}_func_${no}.${ext}`));
      const rawFeature = rawSpecImageUrl(`${itemNo}_feature_${no}.${ext}`);
      const rawFunc = rawSpecImageUrl(`${itemNo}_func_${no}.${ext}`);
      if(rawFeature) group.push(rawFeature);
      if(rawFunc) group.push(rawFunc);
    });
    return firstExistingImageFast(uniqueArray(group), 3200).then(url=> url ? { no, url } : null);
  });

  const fallbackEntries = (await Promise.all(missingChecks)).filter(Boolean);
  urls = mergeFeatureImageSources(localEntries, githubUrls, fallbackEntries);

  if(cacheKey) featureImageUrlCache.set(cacheKey, urls);
  return urls;
}

async function openFeatureViewer(item){
  if(!item) return;
  queueViewLog("주요기능", viewTargetForItem(item), item.itemNo || "");
  currentSpecCategoryKey = "";
  if(els.specHelpGuide) els.specHelpGuide.style.display = "none";
  if(els.specHelpBtn) els.specHelpBtn.style.display = "none";
  specViewerUrls = [];
  specViewerIndex = 0;
  const itemNo = safe(item?.itemNo,"아이템번호");
  specViewerCaption = safe(item?.modelName,"기능 사진");
  els.specViewer.querySelector(".spec-head-title").textContent = "상세 기능 사진";
  els.specViewerTitle.textContent = `${safe(item?.modelName,"모델명 미등록")} · ${safe(item?.itemNo,"")}`;
  els.specViewerCount.textContent = "확인중";
  els.specCarousel.innerHTML = `
    <div class="spec-slide">
      <div class="spec-slide-inner">
        <div class="spec-status-card">
          <div class="spec-status-title">기능 사진을 빠르게 확인하는 중입니다.</div>
          <div class="spec-status-sub">GitHub <b>images</b> 폴더에서<br/><b>${esc(itemNo)}_feature_1.png</b> 형식으로 확인하고 있습니다.</div>
        </div>
        ${renderFeatureReferenceCard(item, 0, 1)}
      </div>
    </div>`;
  els.specDots.innerHTML = "";
  els.specPrev.style.display = "none";
  els.specNext.style.display = "none";
  els.specViewer.classList.add("show");
  els.specViewer.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
  pushSpecHistory();

  const urls = await resolveFeatureImageUrls(item);
  if(!els.specViewer.classList.contains("show")) return;
  if(!urls.length){
    specViewerUrls = [];
    specViewerIndex = 0;
    els.specViewerCount.textContent = "내용";
    els.specCarousel.innerHTML = `
      <div class="spec-slide">
        <div class="spec-slide-inner">
          <div class="spec-status-card">
            <div class="spec-status-title">기능 사진을 찾지 못했습니다.</div>
            <div class="spec-status-sub">GitHub <b>images</b> 폴더에<br/><b>${esc(itemNo)}_feature_1.png</b>, <b>${esc(itemNo)}_feature_2.png</b><br/>형식으로 최대 10장까지 올려주세요.<br/><br/>※ 업로드 직후라면 1분 정도 뒤 다시 열어주세요.</div>
          </div>
          ${renderFeatureReferenceCard(item, 0, 1)}
        </div>
      </div>`;
    els.specDots.innerHTML = "";
    return;
  }
  renderSpecViewerImages(urls, "상세 기능", (i)=>renderFeatureReferenceCard(item, i, urls.length));
}

async function openSpecViewer(item){
  if(!item) return;
  queueViewLog("상세 스펙 사진", viewTargetForItem(item), item.itemNo || "");
  currentSpecCategoryKey = "";
  if(els.specHelpGuide) els.specHelpGuide.style.display = "none";
  if(els.specHelpBtn) els.specHelpBtn.style.display = "none";
  specViewerUrls = [];
  specViewerIndex = 0;
  const itemNo = safe(item?.itemNo,"아이템번호");
  specViewerCaption = safe(item?.modelName,"상세 스펙");
  els.specViewer.querySelector(".spec-head-title").textContent = "상세 스펙 사진";
  els.specViewerTitle.textContent = `${safe(item?.modelName,"모델명 미등록")} · ${safe(item?.itemNo,"")}`;
  els.specViewerCount.textContent = "확인중";
  els.specCarousel.innerHTML = `
    <div class="spec-slide">
      <div class="spec-slide-inner">
        <div class="spec-status-card">
          <div class="spec-status-title">스펙 사진을 불러오는 중입니다.</div>
          <div class="spec-status-sub">GitHub <b>images</b> 폴더에서<br/><b>${esc(itemNo)}_1.png</b> 형식으로 확인하고 있습니다.</div>
        </div>
      </div>
    </div>`;
  els.specDots.innerHTML = "";
  els.specPrev.style.display = "none";
  els.specNext.style.display = "none";
  els.specViewer.classList.add("show");
  els.specViewer.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
  pushSpecHistory();

  const urls = await resolveSpecImageUrls(item);
  if(!els.specViewer.classList.contains("show")) return;
  if(!urls.length){
    specViewerUrls = [];
    specViewerIndex = 0;
    els.specViewerCount.textContent = "없음";
    els.specCarousel.innerHTML = `
      <div class="spec-slide">
        <div class="spec-slide-inner">
          <div class="spec-status-card">
            <div class="spec-status-title">스펙 사진을 찾지 못했습니다.</div>
            <div class="spec-status-sub">GitHub <b>images</b> 폴더에<br/><b>${esc(itemNo)}_1.png</b>, <b>${esc(itemNo)}_2.png</b><br/>형식으로 올려주세요.<br/><br/>※ 앞에 <b>item_</b> 붙이면 안 됩니다.<br/>※ GitHub 업로드 직후라면 1분 정도 뒤 다시 열어주세요.</div>
          </div>
        </div>
      </div>`;
    els.specDots.innerHTML = "";
    return;
  }

  renderSpecViewerImages(urls, "상세 스펙");
}

function closeSpecViewer(fromPop=false){
  closeSpecHelp();
  if(!fromPop && specHistoryPushed){
    try{ history.back(); return; }catch(err){}
  }
  specHistoryPushed = false;
  els.specViewer.classList.remove("show");
  els.specViewer.setAttribute("aria-hidden","true");
  if(els.specHelpGuide) els.specHelpGuide.style.display = "none";
  els.specCarousel.innerHTML = "";
  els.specDots.innerHTML = "";
  specViewerUrls = [];
  if(!els.imageModal.classList.contains("show")) document.body.style.overflow = "";
}

function goSpecViewer(index, smooth=true){
  const slides = els.specCarousel.querySelectorAll(".spec-slide");
  if(!slides.length) return;
  const next = Math.max(0, Math.min(index, slides.length-1));
  specViewerIndex = next;
  els.specCarousel.scrollTo({left: els.specCarousel.clientWidth * next, behavior: smooth ? "smooth" : "auto"});
  updateSpecViewerControls();
}

function moveSpecViewer(step){
  if(specViewerUrls.length < 2) return;
  const next = Math.max(0, Math.min(specViewerIndex + step, specViewerUrls.length - 1));
  if(next === specViewerIndex) return;
  goSpecViewer(next);
}

function updateSpecViewerControls(){
  const slides = els.specCarousel.querySelectorAll(".spec-slide");
  if(!slides.length) return;
  const width = els.specCarousel.clientWidth || 1;
  const idx = Math.max(0, Math.min(Math.round(els.specCarousel.scrollLeft / width), slides.length-1));
  specViewerIndex = idx;
  els.specViewerCount.textContent = `${idx+1}/${slides.length}`;
  els.specDots.querySelectorAll(".spec-dot").forEach((dot,i)=>dot.classList.toggle("active", i===idx));
  els.specPrev.style.display = "none";
  els.specNext.style.display = "none";
  els.specDots.style.display = slides.length > 1 ? "flex" : "none";
}



function renderSpecCategoryCards(){
  if(!els.specCategoryGrid) return;
  els.specCategoryGrid.innerHTML = SPEC_CATEGORY_IMAGES.map(cat=>`
    <article class="spec-category-card" data-key="${esc(cat.key)}">
      <button class="spec-category-open" type="button" data-spec-open="${esc(cat.key)}">
        <div class="spec-category-left">
          <div class="spec-category-icon">${esc(cat.icon)}</div>
          <div>
            <div class="spec-category-title">${esc(cat.label)} 스펙 비교</div>
            <div class="spec-category-desc">${esc(cat.desc)}</div>
          </div>
        </div>
        <div class="spec-category-arrow">›</div>
      </button>
      ${contentFavoriteStarButton("spec",cat.key,"spec-category-star")}
    </article>`).join("");
  els.specCategoryGrid.querySelectorAll("[data-spec-open]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const cat = SPEC_CATEGORY_IMAGES.find(x=>x.key === btn.dataset.specOpen);
      if(cat) openSpecCategoryViewer(cat);
    });
  });
  bindContentFavoriteButtons(els.specCategoryGrid);
}

function getSpecCategoryCandidateUrls(cat){
  const prefix = safe(cat?.prefix, "spec");
  const urls = [];
  for(let i=1;i<=CONFIG.SPEC_IMAGE_MAX_COUNT;i++){
    CONFIG.SPEC_IMAGE_EXTENSIONS.forEach(ext=>{
      urls.push(`${CONFIG.SPEC_IMAGE_RAW_BASE}${prefix}_${i}.${ext}?${CONFIG.SPEC_IMAGE_CACHE_BUST}`);
      urls.push(`${CONFIG.SPEC_IMAGE_BASE_PATH}${prefix}_${i}.${ext}?${CONFIG.SPEC_IMAGE_CACHE_BUST}`);
    });
  }
  return urls;
}

async function fetchGithubCategorySpecUrls(cat){
  try{
    const prefix = safe(cat?.prefix, "").toLowerCase();
    if(!prefix) return [];
    const res = await fetch(`${CONFIG.SPEC_IMAGE_GITHUB_API}&_=${Date.now()}`, { cache:"no-store" });
    if(!res.ok) return [];
    const files = await res.json();
    if(!Array.isArray(files)) return [];
    return files
      .filter(f=>{
        const name = String(f.name || "").toLowerCase();
        return name.startsWith(prefix + "_") && CONFIG.SPEC_IMAGE_EXTENSIONS.some(ext=>name.endsWith("."+ext));
      })
      .sort((a,b)=>naturalCompare(a.name,b.name))
      .map(f=>`${f.download_url}?${CONFIG.SPEC_IMAGE_CACHE_BUST}`);
  }catch(err){
    return [];
  }
}

async function imageExistsWithTimeout(url, timeout=1800){
  return new Promise(resolve=>{
    const img = new Image();
    const timer = setTimeout(()=>{ img.onload = img.onerror = null; resolve(false); }, timeout);
    img.onload = ()=>{ clearTimeout(timer); resolve(true); };
    img.onerror = ()=>{ clearTimeout(timer); resolve(false); };
    img.src = url;
  });
}

async function resolveSpecCategoryImageUrls(cat){
  const cacheKey = safe(cat?.key || cat?.prefix, "");
  if(cacheKey && specCategoryUrlCache.has(cacheKey)) return specCategoryUrlCache.get(cacheKey);

  const prefix = safe(cat?.prefix, "spec");
  const max = Number(CONFIG.SPEC_IMAGE_MAX_COUNT || 10);

  // 1순위: GitHub Pages local images 폴더의 PNG를 먼저 확인합니다.
  // 기존 방식처럼 GitHub API를 먼저 기다리면 휴대폰에서 4~5초 지연될 수 있어 순서를 바꿨습니다.
  const localPngChecks = Array.from({length:max}, (_,i)=>{
    const no = i + 1;
    const url = localSpecImageUrl(`${prefix}_${no}.png`);
    return imageExistsWithTimeout(url, 1600).then(ok=> ok ? { no, url } : null);
  });
  const localPng = (await Promise.all(localPngChecks)).filter(Boolean).sort((a,b)=>a.no-b.no).map(v=>v.url);
  if(localPng.length){
    if(cacheKey) specCategoryUrlCache.set(cacheKey, localPng);
    return localPng;
  }

  // 2순위: 실제 GitHub images 목록 확인
  const github = await fetchGithubCategorySpecUrls(cat);
  if(github.length){
    if(cacheKey) specCategoryUrlCache.set(cacheKey, github);
    return github;
  }

  // 3순위: png 외 확장자까지 직접 확인
  const urls = [];
  for(let i=1;i<=max;i++){
    const group = [];
    CONFIG.SPEC_IMAGE_EXTENSIONS.forEach(ext=>{
      group.push(localSpecImageUrl(`${prefix}_${i}.${ext}`));
      group.push(rawSpecImageUrl(`${prefix}_${i}.${ext}`));
    });
    const found = await firstExistingImage(uniqueArray(group));
    if(found) urls.push(found);
  }
  if(cacheKey) specCategoryUrlCache.set(cacheKey, urls);
  return urls;
}

function preloadImage(url){
  if(!url) return;
  try{
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = url;
  }catch(err){}
}

function prefetchFeatureImages(item){
  if(!item) return;
  const fromSheet = getFeatureImageUrlsFromSheet(item);
  if(fromSheet.length){
    setTimeout(()=>fromSheet.slice(0,4).forEach(preloadImage), 120);
    return;
  }
  const itemNo = getSpecItemNo(item);
  if(!itemNo) return;
  setTimeout(()=>{
    const exts = getSpecImageExtensions();
    for(let i=1;i<=3;i++){
      exts.forEach(ext=>{
        preloadImage(localSpecImageUrl(`${itemNo}_feature_${i}.${ext}`));
      });
    }
  }, 120);
}

function prefetchSpecCategoryFirstImages(){
  if(specPrefetchStarted) return;
  specPrefetchStarted = true;
  setTimeout(()=>{
    SPEC_CATEGORY_IMAGES.forEach(cat=>{
      preloadImage(localSpecImageUrl(`${cat.prefix}_1.png`));
    });
  }, 250);
}

function showSpecHelp(){
  const list = (SPEC_TERM_GUIDES[currentSpecCategoryKey] || []).concat(SPEC_TERM_GUIDES.common || []);
  if(!list.length) return;
  const cat = SPEC_CATEGORY_IMAGES.find(x=>x.key === currentSpecCategoryKey);
  els.specHelpTitle.textContent = cat ? `${cat.label} 용어 설명` : "스펙 용어 설명";
  els.specHelpList.innerHTML = list.map(v=>`<div class="spec-help-item"><div class="spec-help-term">${esc(v.term)}</div><div class="spec-help-desc">${esc(v.desc)}</div></div>`).join("");
  els.specHelpModal.classList.add("show");
  els.specHelpModal.setAttribute("aria-hidden","false");
}

function closeSpecHelp(){
  if(!els.specHelpModal) return;
  els.specHelpModal.classList.remove("show");
  els.specHelpModal.setAttribute("aria-hidden","true");
}


async function openSpecCategoryViewer(cat){
  if(!cat) return;
  queueViewLog("스펙 비교", safe(cat.label || cat.key,"스펙 비교"), "");
  addRecentView({ type:"spec", id:`spec:${cat.key || cat.label}`, title:`${cat.label || cat.key} 스펙 비교`, subtitle:"스펙 비교" });
  currentSpecCategoryKey = cat.key || "";
  const hasSpecHelp = !!SPEC_TERM_GUIDES[currentSpecCategoryKey];
  if(els.specHelpGuide) els.specHelpGuide.style.display = hasSpecHelp ? "flex" : "none";
  if(els.specHelpBtn) els.specHelpBtn.style.display = hasSpecHelp ? "inline-flex" : "none";
  specViewerUrls = [];
  specViewerIndex = 0;
  specViewerCaption = `${cat.label} 스펙 비교`;
  els.specViewer.querySelector(".spec-head-title").textContent = "스펙 비교";
  els.specViewerTitle.textContent = `${cat.label} · 스펙 비교 이미지`;
  els.specViewerCount.textContent = "확인중";
  els.specCarousel.innerHTML = `
    <div class="spec-slide">
      <div class="spec-slide-inner">
        <div class="spec-status-card">
          <div class="spec-status-title">${esc(cat.label)} 스펙 비교를 불러오는 중입니다.</div>
          <div class="spec-status-sub">GitHub <b>images</b> 폴더에서<br/><b>${esc(cat.prefix)}_1.png</b> 형식으로 확인하고 있습니다.</div>
        </div>
      </div>
    </div>`;
  els.specDots.innerHTML = "";
  els.specPrev.style.display = "none";
  els.specNext.style.display = "none";
  els.specViewer.classList.add("show");
  els.specViewer.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
  pushSpecHistory();

  const urls = await resolveSpecCategoryImageUrls(cat);
  if(!els.specViewer.classList.contains("show")) return;
  if(!urls.length){
    specViewerUrls = [];
    specViewerIndex = 0;
    els.specViewerCount.textContent = "없음";
    els.specCarousel.innerHTML = `
      <div class="spec-slide">
        <div class="spec-slide-inner">
          <div class="spec-status-card">
            <div class="spec-status-title">${esc(cat.label)} 스펙 비교 이미지를 찾지 못했습니다.</div>
            <div class="spec-status-sub">GitHub <b>images</b> 폴더에<br/><b>${esc(cat.prefix)}_1.png</b>, <b>${esc(cat.prefix)}_2.png</b><br/>형식으로 올려주세요.<br/><br/>업로드 직후라면 1분 뒤 다시 열어주세요.</div>
          </div>
        </div>
      </div>`;
    els.specDots.innerHTML = "";
    return;
  }
  renderSpecViewerImages(urls, `${cat.label} 스펙 비교`);
}

function renderSpecViewerImages(urls, altBase, extraHtml=""){
  specViewerUrls = urls;
  specViewerIndex = 0;
  els.specCarousel.innerHTML = urls.map((url,i)=>{
    const extra = typeof extraHtml === "function" ? extraHtml(i, url) : (extraHtml || "");
    return `<div class="spec-slide"><div class="spec-slide-inner"><div class="spec-card"><img src="${esc(url)}" data-index="${i}" alt="${esc(altBase)} ${i+1}" loading="eager" onclick="openSpecImageZoom(${i})" /><div class="spec-card-foot"><div class="spec-card-tip">사진을 누르면 확대할 수 있습니다 · 좌우로 밀면 다음 사진으로 이동합니다.</div><span class="spec-card-page">${i+1} / ${urls.length}</span></div></div>${extra}</div></div>`;
  }).join("");
  els.specDots.innerHTML = urls.map((_,i)=>`<span class="spec-dot ${i===0?'active':''}" data-index="${i}"></span>`).join("");
  els.specDots.querySelectorAll(".spec-dot").forEach(dot=>dot.addEventListener("click",()=>goSpecViewer(Number(dot.dataset.index||0))));
  requestAnimationFrame(()=>goSpecViewer(0,false));
}

function renderCompareChips(){
  if(!els.compareChips) return;
  const defaultCats = ["전체","TV","냉장고","세탁기/건조기","에어컨","김치냉장고"];
  const fromDb = uniqueSorted((DB.specCompare || []).map(r=>r.category));
  const cats = uniqueArray(defaultCats.concat(fromDb));
  els.compareChips.innerHTML = cats.map(cat=>`<button class="chip ${compareFilter===cat?'active':''}" type="button" data-cat="${esc(cat)}">${esc(cat)}</button>`).join("");
  els.compareChips.querySelectorAll(".chip").forEach(btn=>{
    btn.addEventListener("click",()=>{
      compareFilter = btn.dataset.cat || "전체";
      renderCompareChips();
      renderSpecCompare();
    });
  });
}

function renderSpecCompare(){
  if(!els.compareTableWrap) return;
  const rows = (DB.specCompare || []).filter(r => compareFilter === "전체" || safe(r.category,"") === compareFilter);
  els.compareCountPill.textContent = `${rows.length}건`;
  if(!rows.length){
    els.compareTableWrap.innerHTML = `<div class="empty" style="margin:0;border:0;border-radius:18px">스펙비교표 데이터가 없습니다.<br/>구글시트 <b>스펙비교표</b> 시트에 카테고리/아이템번호/모델명/상품명과 기능 항목을 입력해 주세요.</div>`;
    return;
  }
  const fixed = ["category","itemNo","modelName","productName","order"];
  const featureNames = [];
  rows.forEach(r => Object.keys(r.features || {}).forEach(k=>{ if(k && !featureNames.includes(k)) featureNames.push(k); }));
  const head = [`<th class="sticky-col">모델/상품</th>`, ...featureNames.map(f=>`<th>${esc(f)}</th>`)].join("");
  const body = rows.map(r=>{
    const title = `<b>${styledText(r.itemNo,"",styleOf(r,"itemNo"))}</b><br/>${styledText(r.modelName,"",styleOf(r,"modelName"))}${r.productName ? `<br/><span style="color:#64748b;font-size:12px">${styledText(r.productName,"",styleOf(r,"productName"))}</span>` : ""}`;
    const cells = featureNames.map(f=>{
      const val = safe((r.features || {})[f], "-");
      const st = (r.featureStyles || {})[f];
      return `<td class="${isPositiveSpecValue(val)?'compare-value-on':isNegativeSpecValue(val)?'compare-value-off':''}">${styledText(val,"-",st)}</td>`;
    }).join("");
    return `<tr><td class="sticky-col">${title}</td>${cells}</tr>`;
  }).join("");
  els.compareTableWrap.innerHTML = `<table class="compare-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function isPositiveSpecValue(v){
  const t = normalizeText(v);
  return ["있음","지원","웰컴에어케어","웰컴쿨링","맞춤건조","자동건조","정음모드","저소음모드","가능","o","yes","y"].some(x=>t.includes(x));
}
function isNegativeSpecValue(v){
  const t = normalizeText(v);
  return ["없음","미지원","불가","x","no","n"].some(x=>t===x || t.includes(x));
}

function openInquiryGuide(){
  if(!els.inquiryGuideModal) return;
  els.inquiryGuideModal.classList.add("show");
  els.inquiryGuideModal.setAttribute("aria-hidden","false");
  document.body.classList.add("inquiry-guide-open");
}

function closeInquiryGuide(){
  if(!els.inquiryGuideModal) return;
  els.inquiryGuideModal.classList.remove("show");
  els.inquiryGuideModal.setAttribute("aria-hidden","true");
  document.body.classList.remove("inquiry-guide-open");
}

async function submitInquiry(){
  const type = safe(els.inquiryType.value, "기타");
  const store = els.inquiryStore.value.trim();
  const name = els.inquiryName.value.trim();
  const phone = els.inquiryPhone.value.trim();
  const orderNo = els.inquiryOrderNo.value.trim();
  const body = els.inquiryBody.value.trim();
  if(!orderNo){
    showInquiryResult("주문번호를 입력해 주세요. 비고 번호가 없으면 HDM 오더번호를 입력해 주세요.", "err");
    els.inquiryOrderNo.focus();
    return;
  }
  if(!body){
    showInquiryResult("배송 관리 요청사항을 입력해 주세요.", "err");
    els.inquiryBody.focus();
    return;
  }
  els.inquirySubmitBtn.disabled = true;
  showInquiryResult("배송 관리 요청을 등록하는 중입니다.", "warn");
  try{
    const res = await apiGet({ action:"submitInquiry", type, store, name, phone, orderNo, body, page: location.href, _: Date.now() });
    if(!res || res.ok === false) throw new Error(res?.message || "등록 실패");
    els.inquiryStore.value = "";
    els.inquiryName.value = "";
    els.inquiryPhone.value = "";
    els.inquiryOrderNo.value = "";
    els.inquiryBody.value = "";
    showInquiryResult("배송 관리 요청이 등록되었습니다. 해당 내용은 관리자만 확인 가능합니다.", "ok");
  }catch(err){
    console.error(err);
    showInquiryResult("배송 관리 요청 등록에 실패했습니다. Apps Script 배포/권한을 확인해 주세요.", "err");
  }finally{
    els.inquirySubmitBtn.disabled = false;
  }
}

function showInquiryResult(msg,type="warn"){
  els.inquiryResult.textContent = msg;
  els.inquiryResult.className = `status show ${type}`;
}

function oneStepSwipe(target, isActive, onLeft, onRight){
  let startX = 0;
  let startY = 0;
  let lastMoveAt = 0;
  target.addEventListener("touchstart",(e)=>{
    if(isActive && !isActive()) return;
    const t = e.changedTouches[0];
    startX = t.clientX;
    startY = t.clientY;
  },{passive:true});
  target.addEventListener("touchmove",(e)=>{
    if(isActive && !isActive()) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if(Math.abs(dx) > 18 && Math.abs(dx) > Math.abs(dy) * 1.25) e.preventDefault();
  },{passive:false});
  target.addEventListener("touchend",(e)=>{
    if(isActive && !isActive()) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if(Math.abs(dx) < 85 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
    const now = Date.now();
    if(now - lastMoveAt < 360) return;
    lastMoveAt = now;
    if(dx > 0) onRight();
    else onLeft();
  },{passive:true});
}

function bindSpecViewerSwipe(){
  oneStepSwipe(els.specViewer, ()=>els.specViewer.classList.contains("show") && !els.imageModal.classList.contains("show"), ()=>moveSpecViewer(1), ()=>moveSpecViewer(-1));
}

function bindCarouselSwipe(){
  oneStepSwipe(els.photoCarousel, null, ()=>goPhoto(selectedPhotoIndex + 1), ()=>goPhoto(selectedPhotoIndex - 1));
}

function bindModalSwipe(){
  oneStepSwipe(els.imageModal, ()=>els.imageModal.classList.contains("show"), ()=>moveModalImage(1), ()=>moveModalImage(-1));
}

function convertDriveImageUrl(url){
  const text = String(url || "").trim();
  if(!text) return "";
  const m1 = text.match(/\/file\/d\/([^/]+)/);
  if(m1) return `https://drive.google.com/uc?export=view&id=${m1[1]}`;
  const m2 = text.match(/[?&]id=([^&]+)/);
  if(text.includes("drive.google.com") && m2) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
  return text;
}


function isAirconItem(item){
  const text = normalizeText([item.category,item.productName,item.modelName,item.keywords].join(" "));
  return text.includes("에어컨") || text.includes("aircon") || text.includes("airconditioner") || text.includes("무풍");
}

function isTvItem(item){
  const text = normalizeText([item.category,item.productName,item.modelName,item.keywords].join(" "));
  return text.includes("tv") || text.includes("티비") || text.includes("텔레비전");
}

function needsWallModel(item){
  const text = normalizeText([item.category,item.productName,item.modelName,item.keywords].join(" "));
  return isTvItem(item) || text.includes("모니터") || text.includes("monitor");
}

function isLogisticsDept(r){
  const text = normalizeText([r.type,r.deptName,r.scope,r.keywords].join(" "));
  return text.includes("물류") || text.includes("tc") || text.includes("배송지역");
}

function displayDeptType(r){
  const text = normalizeText([r.type,r.deptName,r.scope,r.keywords].join(" "));
  if(text.includes("물류") || text.includes("tc") || text.includes("배송지역")) return "물류";
  if(text.includes("삼성") || text.includes("서비스") || text.includes("a/s") || text.includes("as")) return "서비스";
  if(text.includes("업무지원")) return "업무지원실";
  return safe(r.type,"기타") === "삼성" ? "서비스" : safe(r.type,"기타");
}

function uniqueSorted(arr){
  return Array.from(new Set(arr.map(v=>String(v).trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"ko"));
}

function normalize(v){ return normalizeItemNo(v); }
function normalizeItemNo(v){ return String(v ?? "").replace(/[^0-9]/g,"").trim(); }

function styleOf(obj, key){
  return obj && obj.styles ? obj.styles[key] : null;
}
function mergeTextStyles(...styles){
  const out = {};
  styles.filter(Boolean).forEach(st=>{
    ["color","fontSize","fontWeight","fontStyle","textDecoration"].forEach(key=>{ if(st[key]) out[key]=st[key]; });
  });
  return Object.keys(out).length ? out : null;
}
function styleAttr(style){
  if(!style || typeof style !== "object") return "";
  const rules = [];
  const color = String(style.color || "").trim();
  if(/^#[0-9a-fA-F]{3,8}$/.test(color) || /^[a-zA-Z]+$/.test(color)) rules.push(`color:${color} !important`);
  const fs = Number(style.fontSize);
  if(Number.isFinite(fs) && fs > 0) rules.push(`font-size:${fs}pt`);
  const fw = String(style.fontWeight || "").trim();
  if(fw === "bold" || fw === "700" || fw === "800" || fw === "900") rules.push("font-weight:1000");
  const fst = String(style.fontStyle || "").trim();
  if(fst === "italic") rules.push("font-style:italic");
  const deco = String(style.textDecoration || "").trim();
  if(deco === "underline" || deco === "line-through") rules.push(`text-decoration:${deco}`);
  return rules.length ? ` style="${esc(rules.join(";"))}"` : "";
}
function styledText(v, fallback="", style=null){
  const text = safe(v, fallback);
  const rich = style && Array.isArray(style.__rich) ? style.__rich : null;
  if(rich && safe(v,"").trim() !== ""){
    return rich.map(seg=>{
      const segStyle = mergeTextStyles(style, seg && seg.style ? seg.style : null);
      return `<span${styleAttr(segStyle)}>${esc(seg && seg.text ? seg.text : "")}</span>`;
    }).join("");
  }
  return `<span${styleAttr(style)}>${esc(text)}</span>`;
}

function normalizeText(v){ return String(v ?? "").toLowerCase().replace(/\s+/g,"").trim(); }
function safe(v,f="-"){ return v === undefined || v === null || String(v).trim() === "" ? f : String(v).trim(); }
function esc(v){ return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }
function debounce(fn,ms){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args),ms); }; }
function formatToday(){ const d=new Date(); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`; }

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}


// ============================================================================
// v129 진열 연출 점검 촬영
// ============================================================================
const DISPLAY_CHECK_FALLBACK_ITEMS = [
  {sort:1,code:"qled_tv",title:"QLED TV",pptCategory:"TV",guide:"QLED TV 전체와 가격표가 함께 보이도록 정면에서 촬영해 주세요.",exampleImage:"A01.jpg",applicableStores:"전체"},
  {sort:2,code:"oled_tv",title:"OLED TV",pptCategory:"TV",guide:"OLED TV 전체와 가격표가 함께 보이도록 정면에서 촬영해 주세요.",exampleImage:"A02.jpg",applicableStores:"전체"},
  {sort:3,code:"tv_fixture",title:"TV 집기",pptCategory:"TV",guide:"TV 진열 집기 전체와 주변 노출 상태가 보이도록 촬영해 주세요.",exampleImage:"A03.jpg",applicableStores:"전체"},
  {sort:4,code:"fridge_vignette",title:"냉장고 비네트 집기",pptCategory:"REF",guide:"냉장고 비네트 집기 전체와 제품·가격표가 함께 보이도록 촬영해 주세요.",exampleImage:"A04.jpg",applicableStores:"전체"},
  {sort:5,code:"clothing_care_vignette",title:"의류케어 비네트 집기",pptCategory:"REF",guide:"세탁기·건조기·의류케어 비네트 집기 전체가 보이도록 촬영해 주세요.",exampleImage:"A05.jpg",applicableStores:"전체"},
  {sort:6,code:"online_vignette_1",title:"온라인 비네트 1",pptCategory:"REF",guide:"온라인 비네트 전체 구성과 노출 상태가 보이도록 촬영해 주세요.",exampleImage:"A06.jpg",applicableStores:"대구점,혁신점,세종점,하남점"},
  {sort:7,code:"online_vignette_2",title:"온라인 비네트 2",pptCategory:"REF",guide:"추가 온라인 비네트의 제품 배열과 안내물이 보이도록 촬영해 주세요.",exampleImage:"A07.jpg",applicableStores:"대구점,혁신점,세종점,하남점"},
  {sort:8,code:"stand_aircon_1",title:"스탠드 에어컨 1",pptCategory:"AC",guide:"스탠드 에어컨 전체와 행사 가격표가 함께 보이도록 촬영해 주세요.",exampleImage:"A08.jpg",applicableStores:"전체"},
  {sort:9,code:"stand_aircon_2",title:"스탠드 에어컨 2",pptCategory:"AC",guide:"추가 스탠드 에어컨 진열과 주변 연출 상태가 보이도록 촬영해 주세요.",exampleImage:"A09.jpg",applicableStores:"전체"},
  {sort:10,code:"wall_aircon",title:"벽걸이 에어컨",pptCategory:"AC",guide:"벽걸이 에어컨과 실내기 진열 상태가 보이도록 촬영해 주세요.",exampleImage:"A10.jpg",applicableStores:"전체"},
  {sort:11,code:"window_aircon",title:"창문형 에어컨",pptCategory:"AC",guide:"창문형 에어컨 본체와 가격표가 함께 보이도록 촬영해 주세요.",exampleImage:"A11.jpg",applicableStores:"전체"},
  {sort:12,code:"ceiling_aircon",title:"천장형 에어컨",pptCategory:"AC",guide:"천장형 에어컨 진열물과 안내물이 함께 보이도록 촬영해 주세요.",exampleImage:"A12.jpg",applicableStores:"전체"},
  {sort:13,code:"moving_style_1",title:"무빙스타일 1",pptCategory:"MON",guide:"무빙스타일 제품 전체와 활용 연출이 보이도록 촬영해 주세요.",exampleImage:"A13.jpg",applicableStores:"전체"},
  {sort:14,code:"moving_style_2",title:"무빙스타일 2",pptCategory:"MON",guide:"추가 무빙스타일 제품과 가격표가 함께 보이도록 촬영해 주세요.",exampleImage:"A14.jpg",applicableStores:"전체"},
  {sort:15,code:"monitor",title:"모니터",pptCategory:"MON",guide:"모니터 제품과 화면·가격표가 함께 보이도록 촬영해 주세요.",exampleImage:"A15.jpg",applicableStores:"전체"},
  {sort:16,code:"microwave",title:"전자레인지",pptCategory:"COOK",guide:"전자레인지 제품과 가격표가 함께 보이도록 촬영해 주세요.",exampleImage:"A16.jpg",applicableStores:"전체"},
  {sort:17,code:"qooker",title:"큐커",pptCategory:"COOK",guide:"큐커 제품 전체와 행사 안내물이 함께 보이도록 촬영해 주세요.",exampleImage:"A17.jpg",applicableStores:"전체"},
  {sort:18,code:"induction_2burner",title:"2구 인덕션",pptCategory:"COOK",guide:"2구 인덕션 제품과 진열·가격표가 보이도록 촬영해 주세요.",exampleImage:"A18.jpg",applicableStores:"전체"},
  {sort:19,code:"dehumidifier",title:"제습기",pptCategory:"ETC",guide:"제습기 제품 전체와 가격표가 함께 보이도록 촬영해 주세요.",exampleImage:"A19.jpg",applicableStores:"전체"},
  {sort:20,code:"vacuum_cleaner",title:"청소기",pptCategory:"ETC",guide:"청소기 제품과 액세서리 진열 상태가 보이도록 촬영해 주세요.",exampleImage:"A20.jpg",applicableStores:"전체"}
]
const DISPLAY_CHECK_STORES = ["양평점","대구점","대전점","양재점","상봉점","일산점","부산점","울산점","광명점","천안점","의정부점","공세점","송도점","세종점","혁신점","하남점","김해점","고척점","청라점","평택점"];

function getKoreaDateString(){
  const now = new Date(Date.now() + 9*60*60*1000);
  return now.toISOString().slice(0,10);
}

function displayCheckKstToday(){
  const kstNow = new Date(Date.now() + 9*60*60*1000);
  return new Date(Date.UTC(kstNow.getUTCFullYear(),kstNow.getUTCMonth(),kstNow.getUTCDate()));
}

function displayCheckWeekRowsForYear(year){
  const targetYear = Number(year) || displayCheckKstToday().getUTCFullYear();
  const jan1 = new Date(Date.UTC(targetYear,0,1));
  const janDay = jan1.getUTCDay() || 7;
  const firstMonday = new Date(jan1);
  firstMonday.setUTCDate(jan1.getUTCDate()-janDay+1);
  const dec31 = new Date(Date.UTC(targetYear,11,31));
  const decDay = dec31.getUTCDay() || 7;
  const lastMonday = new Date(dec31);
  lastMonday.setUTCDate(dec31.getUTCDate()-decDay+1);
  const total = Math.round((lastMonday-firstMonday)/604800000)+1;
  const iso = d=>d.toISOString().slice(0,10);
  return Array.from({length:total},(_,index)=>{
    const monday = new Date(firstMonday);
    monday.setUTCDate(firstMonday.getUTCDate()+index*7);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate()+6);
    const thursday = new Date(monday);
    thursday.setUTCDate(monday.getUTCDate()+3);
    const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((thursday-yearStart)/86400000)+1)/7);
    const week = `W${String(weekNo).padStart(2,"0")}`;
    const label = `${week}(${monday.getUTCMonth()+1}월${monday.getUTCDate()}일~${sunday.getUTCMonth()+1}월${sunday.getUTCDate()}일)`;
    return {year:targetYear,week,start:iso(monday),end:iso(sunday),label};
  });
}

function displayCheckCurrentWeekInfo(){
  const today = displayCheckKstToday();
  const year = today.getUTCFullYear();
  const rows = displayCheckWeekRowsForYear(year);
  return rows.find(row=>row.start<=today.toISOString().slice(0,10)&&row.end>=today.toISOString().slice(0,10)) || rows[0];
}

function populateDisplayCheckYearOptions(){
  if(!els.displayCheckYear) return;
  const currentYear = displayCheckKstToday().getUTCFullYear();
  const selected = Number(els.displayCheckYear.value) || currentYear;
  const startYear = 2026;
  const endYear = Math.max(currentYear+5,2031);
  els.displayCheckYear.innerHTML = Array.from({length:endYear-startYear+1},(_,i)=>startYear+i)
    .map(year=>`<option value="${year}" ${year===selected?"selected":""}>${year}년</option>`).join("");
  if(!els.displayCheckYear.value) els.displayCheckYear.value = String(currentYear);
}

function populateDisplayCheckWeekOptions(preferredStart=""){
  if(!els.displayCheckDate) return;
  populateDisplayCheckYearOptions();
  const currentInfo = displayCheckCurrentWeekInfo();
  const selectedYear = Number(els.displayCheckYear?.value) || currentInfo.year;
  const rows = displayCheckWeekRowsForYear(selectedYear);
  const previous = preferredStart || els.displayCheckDate.value;
  let selectedStart = rows.some(row=>row.start===previous) ? previous : "";
  if(!selectedStart && selectedYear===currentInfo.year) selectedStart = currentInfo.start;
  if(!selectedStart) selectedStart = rows[0]?.start || "";
  els.displayCheckDate.innerHTML = rows.map(row=>`<option value="${row.start}" data-year="${row.year}" data-week="${row.week}" data-end="${row.end}" ${row.start===selectedStart?"selected":""}>${row.label}</option>`).join("");
}

function selectedDisplayCheckWeek(){
  const option = els.displayCheckDate?.selectedOptions?.[0];
  const fallback = displayCheckCurrentWeekInfo();
  return {
    year:Number(option?.dataset.year || els.displayCheckYear?.value || fallback.year),
    start:option?.value || fallback.start,
    end:option?.dataset.end || fallback.end,
    week:option?.dataset.week || fallback.week,
    label:option?.textContent || fallback.label
  };
}

function bindDisplayCheckEvents(){
  if(els.displayCheckStore){
    els.displayCheckStore.innerHTML = '<option value="">점포를 선택하세요</option>' + DISPLAY_CHECK_STORES.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");
    els.displayCheckStore.addEventListener("change",()=>{
      displayCheckStatusLoadedKey = "";
      displayCheckState = new Map();
      renderDisplayCheckPage();
      if(els.displayCheckStore.value) loadDisplayCheckStatus(true);
    });
  }
  if(els.displayCheckYear){
    populateDisplayCheckYearOptions();
    els.displayCheckYear.addEventListener("change",()=>{
      populateDisplayCheckWeekOptions("");
      displayCheckStatusLoadedKey = "";
      displayCheckState = new Map();
      renderDisplayCheckPage();
      if(els.displayCheckStore?.value) loadDisplayCheckStatus(true);
    });
  }
  if(els.displayCheckDate){
    populateDisplayCheckWeekOptions();
    els.displayCheckDate.addEventListener("change",()=>{
      displayCheckStatusLoadedKey = "";
      displayCheckState = new Map();
      renderDisplayCheckPage();
      if(els.displayCheckStore?.value) loadDisplayCheckStatus(true);
    });
  }
  if(els.displayCheckUploader){
    try{ els.displayCheckUploader.value = localStorage.getItem("costco_hub_display_check_uploader") || ""; }catch(e){}
    els.displayCheckUploader.addEventListener("input",()=>{
      try{ localStorage.setItem("costco_hub_display_check_uploader", els.displayCheckUploader.value.trim()); }catch(e){}
    });
  }
  if(els.displayCheckRefreshBtn) els.displayCheckRefreshBtn.addEventListener("click",()=>loadDisplayCheckStatus(true));
  if(els.displayCheckCamera) els.displayCheckCamera.addEventListener("change",handleDisplayCheckCameraFile);
  if(els.displayCheckList){
    els.displayCheckList.addEventListener("click",event=>{
      const capture = event.target.closest("[data-display-capture]");
      if(capture){ startDisplayCheckCapture(capture.dataset.displayCapture || ""); return; }
      const preview = event.target.closest("[data-display-preview]");
      if(preview){ openDisplayCheckPreview(preview.dataset.displayPreview || ""); return; }
      const example = event.target.closest("[data-display-example]");
      if(example){
        const item = displayCheckItems().find(x=>x.code === example.dataset.displayExample);
        const img = example.querySelector("img");
        const fallback = item ? displayCheckExampleCandidates(item.exampleImage)[0] : "";
        const url = img && img.style.display !== "none" ? (img.currentSrc || img.src || fallback) : fallback;
        if(url) openImageModal([url],0,`${item?.title || "촬영"} 예시`);
      }
    });
  }
  window.addEventListener("message",event=>{
    const data = event.data || {};
    if(data.source !== "COSTCO_HUB_DISPLAY_CHECK_UPLOAD" || !data.uploadToken) return;
    const pending = displayCheckUploadResolvers.get(String(data.uploadToken));
    if(!pending) return;
    displayCheckUploadResolvers.delete(String(data.uploadToken));
    clearTimeout(pending.timer);
    try{ pending.frame?.remove(); }catch(e){}
    if(data.ok) pending.resolve(data);
    else pending.reject(new Error(data.message || "사진 등록에 실패했습니다."));
  });
}

function normalizeDisplayCheckStoreName(value){
  const raw = safe(value,"").replace(/^코스트코\s*/,"").replace(/\s+/g,"");
  if(!raw) return "";
  return raw.endsWith("점") ? raw : raw+"점";
}

function displayCheckItemAppliesToStore(item,store){
  const selected = normalizeDisplayCheckStoreName(store);
  if(!selected) return true;
  const raw = safe(item.applicableStores,"");
  if(!raw || /^(전체|ALL|\*)$/i.test(raw)) return true;
  const stores = raw.split(/[,，;|\n]+/).map(normalizeDisplayCheckStoreName).filter(Boolean);
  return stores.includes(selected);
}

function displayCheckGroupName(sort){
  const n = Number(sort)||0;
  if(n<=3) return "TV";
  if(n<=5) return "비네트";
  if(n<=7) return "온라인 비네트";
  if(n<=12) return "에어컨";
  if(n<=15) return "모니터";
  if(n<=18) return "조리기기";
  return "기타";
}

function displayCheckLegacyExample(sort){
  const legacy = {
    1:"qled_tv_example.svg",2:"oled_tv_example.svg",3:"tv_fixture_example.svg",
    4:"fridge_fixture_1_example.svg",5:"clothing_care_fixture_example.svg",
    6:"fridge_fixture_1_example.svg",7:"fridge_fixture_2_example.svg",
    8:"stand_aircon_example.svg",9:"stand_aircon_example.svg",10:"wall_aircon_example.svg",
    11:"window_aircon_example.svg",12:"system_aircon_example.svg",
    13:"monitor_fixture_example.svg",14:"monitor_fixture_example.svg",15:"monitor_fixture_example.svg",
    16:"cooking_fixture_example.svg",17:"cooking_fixture_example.svg",18:"cooking_fixture_example.svg",
    19:"store_overview_example.svg",20:"cleaner_fixture_example.svg"
  };
  return legacy[Number(sort)] || "";
}

function displayCheckRowValue(row,keys,fallback=""){
  if(Array.isArray(row)){
    const indexMap={
      sort:0, code:1, title:2, pptCategory:3, guide:4,
      exampleImage:5, use:6, applicableStores:7
    };
    for(const key of keys){
      const idx=indexMap[key];
      if(idx===undefined) continue;
      const value=row[idx];
      if(value!==undefined && value!==null && String(value).trim()!=="") return value;
    }
    return fallback;
  }
  if(!row || typeof row!=="object") return fallback;
  for(const key of keys){
    if(row[key]!==undefined && row[key]!==null && String(row[key]).trim()!=="") return row[key];
  }
  return fallback;
}

function normalizeDisplayCheckRows(rows){
  if(!Array.isArray(rows)) return [];
  return rows.map((row,index)=>{
    const sort = Number(displayCheckRowValue(row,["sort","순번","정렬","번호"],index+1)) || index + 1;
    const indexedImage = `A${String(sort).padStart(2,"0")}.jpg`;
    const rawImage = safe(displayCheckRowValue(row,["exampleImage","예시이미지","예시 이미지","이미지"],""),"");
    // v130: 시트 응답 형식이 객체·배열·한글 열 이름 중 어느 형태여도 안전하게 읽습니다.
    const exampleImage = (!rawImage || /_example\.svg(?:[?#].*)?$/i.test(rawImage)) ? indexedImage : rawImage;
    return {
      sort,
      code:safe(displayCheckRowValue(row,["code","itemCode","항목코드","코드"],""),"").toLowerCase(),
      title:safe(displayCheckRowValue(row,["title","itemName","항목명","제목"],""),`항목 ${index+1}`),
      pptCategory:safe(displayCheckRowValue(row,["pptCategory","PPT분류","분류","카테고리"],"ETC"),"ETC").toUpperCase(),
      guide:safe(displayCheckRowValue(row,["guide","description","촬영기준","안내","설명"],""),"촬영 예시와 동일한 구도로 촬영해 주세요."),
      exampleImage,
      applicableStores:safe(displayCheckRowValue(row,["applicableStores","applyStores","stores","적용점포","대상점포","노출점포"],"전체"),"전체"),
      groupName:displayCheckGroupName(sort),
      legacyExampleImage:displayCheckLegacyExample(sort)
    };
  }).filter(x=>x.code && x.title)
    .sort((a,b)=>a.sort-b.sort);
}

function displayCheckItems(storeOverride){
  const store = storeOverride !== undefined ? storeOverride : (els.displayCheckStore?.value || "");
  const remoteRows = Array.isArray(DB.displayCheckItems) ? DB.displayCheckItems : [];
  let normalized = normalizeDisplayCheckRows(remoteRows);

  // v130: 서버/시트가 빈 값이나 예상과 다른 형식을 반환해도 화면을 0/0으로 덮어쓰지 않습니다.
  if(!normalized.length) normalized = normalizeDisplayCheckRows(DISPLAY_CHECK_FALLBACK_ITEMS);
  let visible = normalized.filter(x=>displayCheckItemAppliesToStore(x,store));
  if(!visible.length){
    visible = normalizeDisplayCheckRows(DISPLAY_CHECK_FALLBACK_ITEMS)
      .filter(x=>displayCheckItemAppliesToStore(x,store));
  }
  return visible;
}

function displayCheckExampleFile(value){
  return safe(value,"").replace(/^\.?\/?images\/display-check\//i,"");
}

function displayCheckExampleCandidates(value,legacyValue=""){
  const values = [safe(value,""),safe(legacyValue,"")].filter(Boolean);
  const out = [];
  values.forEach(v=>{
    if(/^data:/i.test(v) || /^https?:\/\//i.test(v)){
      if(!out.includes(v)) out.push(v);
      return;
    }
    const file = displayCheckExampleFile(v);
    if(!file) return;
    const local = new URL(`./images/display-check/${file}`, document.baseURI).href + `?v=130`;
    const raw = `https://raw.githubusercontent.com/kimyoungun90-beep/samsung-item-hub/main/images/display-check/${encodeURIComponent(file).replace(/%2F/gi,"/")}?v=130`;
    if(!out.includes(local)) out.push(local);
    if(!out.includes(raw)) out.push(raw);
  });
  return out;
}

function displayCheckExampleUrl(value){
  return displayCheckExampleCandidates(value)[0] || "";
}

function displayCheckTryNextExample(img){
  let candidates=[];
  try{ candidates=JSON.parse(decodeURIComponent(img.dataset.exampleCandidates||"%5B%5D")); }catch(e){}
  const next=candidates.shift();
  img.dataset.exampleCandidates=encodeURIComponent(JSON.stringify(candidates));
  if(next){ img.src=next; return; }
  img.style.display="none";
  img.parentElement?.classList.add("image-missing");
}

function displayCheckExampleMarkup(item){
  const candidates = displayCheckExampleCandidates(item.exampleImage,item.legacyExampleImage);
  if(!candidates.length) return "";
  const first = candidates.shift();
  const encoded = encodeURIComponent(JSON.stringify(candidates));
  return `<img src="${esc(first)}" data-example-candidates="${esc(encoded)}" alt="${esc(item.title)} 촬영 예시" onerror="displayCheckTryNextExample(this)">`;
}

async function ensureDisplayCheckItemsLoaded(force=false){
  const now = Date.now();
  if(displayCheckItemsLoading) return displayCheckItemsLoading;
  if(!force && displayCheckItemsLoadedAt && now - displayCheckItemsLoadedAt < 5*60*1000) return DB.displayCheckItems;

  displayCheckItemsLoading = (async()=>{
    try{
      const result = await apiGet({ action:"displayCheckItems", _:String(Date.now()) });
      if(result && result.ok !== false && Array.isArray(result.items) && result.items.length){
        const normalized = normalizeDisplayCheckRows(result.items);
        if(normalized.length){
          DB.displayCheckItems = result.items;
          displayCheckItemsLoadedAt = Date.now();
          if(currentPage === "displayCheck") renderDisplayCheckPage();
          return result.items;
        }
        console.warn("진열 연출 항목 응답 형식이 올바르지 않아 기본 20개 항목을 유지합니다.", result.items);
      }
    }catch(e){
      console.warn("진열 연출 항목 최신 정보 확인 실패:", e);
    }finally{
      displayCheckItemsLoading = null;
    }
    return DB.displayCheckItems;
  })();
  return displayCheckItemsLoading;
}

function openDisplayCheckPage(){
  populateDisplayCheckYearOptions();
  populateDisplayCheckWeekOptions();
  renderDisplayCheckPage();
  // v129: 저장 DB에 촬영 항목 설정이 없거나 오래되어도 시트의 최신 예시 이미지 파일명을 별도로 확인합니다.
  ensureDisplayCheckItemsLoaded(false);
  if(els.displayCheckStore?.value) loadDisplayCheckStatus(false);
}

function setDisplayCheckStatus(message,type=""){
  if(!els.displayCheckStatus) return;
  els.displayCheckStatus.textContent = message;
  els.displayCheckStatus.className = "display-check-status" + (type ? " "+type : "");
}

function renderDisplayCheckPage(){
  if(!els.displayCheckList) return;
  const store = els.displayCheckStore?.value || "";
  const items = displayCheckItems(store);
  const completed = items.filter(item=>displayCheckState.get(item.code)?.done).length;
  if(els.displayCheckProgressText) els.displayCheckProgressText.textContent = `${completed} / ${items.length}`;
  if(els.displayCheckProgressBar) els.displayCheckProgressBar.style.width = `${items.length ? Math.round(completed/items.length*100) : 0}%`;
  if(!store){
    els.displayCheckList.innerHTML = '<div class="display-check-empty">점포를 먼저 선택해 주세요.<br>선택 후 촬영해야 할 항목이 순서대로 표시됩니다.</div>';
    return;
  }
  let lastGroup="";
  els.displayCheckList.innerHTML = items.map(item=>{
    const state = displayCheckState.get(item.code) || {};
    const cls = state.uploading || state.verifying ? " uploading" : (state.done ? " done" : (state.failed ? " failed" : ""));
    const status = state.verifying ? "서버 저장 여부 확인 중" : (state.uploading ? "촬영 완료 · 전송 중" : (state.done ? `전송 완료${state.uploadedAt ? " · "+esc(state.uploadedAt) : ""}` : (state.failed ? "전송 실패 · 다시 촬영해 주세요" : "미촬영")));
    const buttonText = state.uploading || state.verifying ? "확인 중" : (state.done ? "다시 촬영" : "촬영하기");
    let groupHeader="";
    if(item.groupName!==lastGroup){
      lastGroup=item.groupName;
      const count=items.filter(x=>x.groupName===item.groupName).length;
      groupHeader=`<div class="display-check-group-title"><span>${esc(item.groupName)}</span><span class="display-check-group-count">${count}개</span></div>`;
    }
    return `${groupHeader}<article class="display-check-card${cls}" data-display-code="${esc(item.code)}">
      <div class="display-check-example" data-display-example="${esc(item.code)}">
        ${displayCheckExampleMarkup(item)}
        <span>촬영 예시</span>
      </div>
      <div class="display-check-card-copy">
        <div class="display-check-card-head"><span class="display-check-card-no">${String(item.sort).padStart(2,"0")}</span><div class="display-check-card-title">${esc(item.title)}</div></div>
        <div class="display-check-card-guide">${esc(item.guide)}</div>
        <div class="display-check-card-state">${status}</div>
      </div>
      <div class="display-check-card-action">
        <button class="display-check-capture-btn" type="button" data-display-capture="${esc(item.code)}" ${state.uploading||state.verifying?"disabled":""}>${buttonText}</button>
        <button class="display-check-preview-btn" type="button" data-display-preview="${esc(item.code)}" ${state.previewUrl||state.imageUrl?"":"hidden"}>촬영 사진 보기</button>
      </div>
    </article>`;
  }).join("");
}

async function loadDisplayCheckStatus(force=false){
  const store = els.displayCheckStore?.value || "";
  const week = selectedDisplayCheckWeek();
  const shotDate = week.start;
  if(!store){ setDisplayCheckStatus("점포를 선택해 주세요.","err"); return; }
  const key = `${store}|${shotDate}`;
  if(!force && displayCheckStatusLoadedKey === key) return;
  setDisplayCheckStatus("기존 촬영 현황을 확인하고 있습니다.","loading");
  try{
    const result = await apiGet({action:"displayCheckPhotos",store,shotDate,latestOnly:"1",includeData:"0",max:"40"});
    if(!result?.ok) throw new Error(result?.message || "촬영 현황을 불러오지 못했습니다.");
    displayCheckState = new Map();
    (result.photos || []).forEach(row=>displayCheckState.set(row.itemCode,{
      done:true,imageUrl:row.imageUrl||"",recordId:row.fileId||"",uploadedAt:row.uploadedAt||""
    }));
    displayCheckStatusLoadedKey = key;
    renderDisplayCheckPage();
    const total = displayCheckItems().length;
    const done = Array.from(displayCheckState.values()).filter(x=>x.done).length;
    setDisplayCheckStatus(`${store} ${week.year}년 ${week.label} 촬영 현황: ${done}/${total}개 완료`, done===total?"ok":"");
  }catch(err){
    setDisplayCheckStatus(`촬영 현황 확인 실패: ${err.message || err}`,"err");
  }
}

function startDisplayCheckCapture(code){
  const store = els.displayCheckStore?.value || "";
  if(!store){ setDisplayCheckStatus("점포를 먼저 선택해 주세요.","err"); els.displayCheckStore?.focus(); return; }
  const state = displayCheckState.get(code) || {};
  if(state.uploading){ setDisplayCheckStatus("이 항목의 사진을 전송 중입니다. 다른 항목은 계속 촬영할 수 있습니다.","loading"); return; }
  const item = displayCheckItems().find(x=>x.code===code);
  if(!item) return;
  displayCheckPendingItemCode = code;
  els.displayCheckCamera.value = "";
  els.displayCheckCamera.click();
}

function displayCheckDelay(ms){ return new Promise(resolve=>setTimeout(resolve,ms)); }

async function verifyDisplayCheckUpload(store,shotDate,itemCode,uploadToken){
  const waits=[0,2500,5000,8000];
  for(const delay of waits){
    if(delay) await displayCheckDelay(delay);
    try{
      const result=await apiGet({action:"displayCheckPhotos",store,shotDate,latestOnly:"1",includeData:"0",max:"80",_:String(Date.now())});
      if(!result?.ok) continue;
      const row=(result.photos||[]).find(photo=>{
        if(uploadToken && photo.uploadToken===uploadToken) return true;
        return !uploadToken && photo.itemCode===itemCode;
      });
      if(row) return row;
    }catch(e){}
  }
  return null;
}

function handleDisplayCheckCameraFile(event){
  const file = event.target.files && event.target.files[0];
  const code = displayCheckPendingItemCode;
  displayCheckPendingItemCode = "";
  event.target.value = "";
  if(!file || !code) return;
  const item = displayCheckItems().find(x=>x.code===code);
  if(!item) return;
  const store = els.displayCheckStore?.value || "";
  const week = selectedDisplayCheckWeek();
  const shotDate = week.start;
  const uploader = els.displayCheckUploader?.value.trim() || "";
  const captureId = `${Date.now()}_${++displayCheckCaptureSequence}`;
  const previous = displayCheckState.get(code) || {};
  const previewUrl = URL.createObjectURL(file);

  displayCheckState.set(code,{...previous,done:true,uploading:true,failed:false,previewUrl,captureId,uploadedAt:""});
  renderDisplayCheckPage();
  setDisplayCheckStatus(`${item.title} 촬영 완료 · 전송 중입니다. 다음 항목을 계속 촬영할 수 있습니다.`,"ok");

  (async()=>{
    try{
      const compressed = await compressDisplayCheckImage(file,1280,.72);
      const current = displayCheckState.get(code) || {};
      if(current.captureId !== captureId) return;
      current.previewUrl = compressed.dataUrl;
      displayCheckState.set(code,current);
      renderDisplayCheckPage();
      try{ URL.revokeObjectURL(previewUrl); }catch(e){}

      const result = await submitDisplayCheckUpload({
        store,shotDate,uploader,
        itemCode:item.code,itemName:item.title,pptCategory:item.pptCategory,
        imageData:compressed.dataUrl
      });
      const latest = displayCheckState.get(code) || {};
      if(latest.captureId !== captureId) return;
      displayCheckState.set(code,{
        ...latest,done:true,uploading:false,failed:false,previewUrl:compressed.dataUrl,imageUrl:result.imageUrl||"",
        recordId:result.fileId||result.recordId||"",uploadedAt:"방금 전송"
      });
      displayCheckStatusLoadedKey = `${store}|${shotDate}`;
      renderDisplayCheckPage();
      setDisplayCheckStatus(`${item.title} 사진 전송이 완료되었습니다.`,"ok");
    }catch(err){
      let latest = displayCheckState.get(code) || {};
      if(latest.captureId !== captureId) return;
      if(err && err.uploadToken){
        displayCheckState.set(code,{...latest,done:true,uploading:false,verifying:true,failed:false});
        renderDisplayCheckPage();
        setDisplayCheckStatus(`${item.title} 사진이 서버에 저장됐는지 확인하고 있습니다.`,"loading");
        const verified = await verifyDisplayCheckUpload(store,shotDate,item.code,err.uploadToken);
        latest = displayCheckState.get(code) || {};
        if(latest.captureId !== captureId) return;
        if(verified){
          displayCheckState.set(code,{
            ...latest,done:true,uploading:false,verifying:false,failed:false,
            imageUrl:verified.imageUrl||latest.imageUrl||"",
            recordId:verified.fileId||latest.recordId||"",
            uploadedAt:"서버 저장 확인"
          });
          displayCheckStatusLoadedKey = `${store}|${shotDate}`;
          renderDisplayCheckPage();
          setDisplayCheckStatus(`${item.title} 사진이 정상 저장된 것을 확인했습니다.`,"ok");
          return;
        }
      }
      latest = displayCheckState.get(code) || {};
      displayCheckState.set(code,{...latest,done:false,uploading:false,verifying:false,failed:true});
      renderDisplayCheckPage();
      setDisplayCheckStatus(`${item.title} 전송 실패: ${err.message || err}`,"err");
    }
  })();
}

function compressDisplayCheckImage(file,maxSide=1280,quality=.72){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onerror = ()=>reject(new Error("사진을 읽지 못했습니다."));
    reader.onload = ()=>{
      const img = new Image();
      img.onerror = ()=>reject(new Error("이 사진 형식은 처리할 수 없습니다. 카메라로 다시 촬영해 주세요."));
      img.onload = ()=>{
        const ratio = Math.min(1,maxSide/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height));
        const width = Math.max(1,Math.round((img.naturalWidth||img.width)*ratio));
        const height = Math.max(1,Math.round((img.naturalHeight||img.height)*ratio));
        const canvas = document.createElement("canvas");
        canvas.width=width;canvas.height=height;
        const ctx=canvas.getContext("2d",{alpha:false});
        ctx.fillStyle="#fff";ctx.fillRect(0,0,width,height);
        ctx.drawImage(img,0,0,width,height);
        const dataUrl=canvas.toDataURL("image/jpeg",quality);
        resolve({dataUrl,width,height,byteSize:Math.round((dataUrl.split(",")[1]||"").length*3/4)});
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function submitDisplayCheckUpload(payload){
  return new Promise((resolve,reject)=>{
    const token = `dc_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const frame=document.createElement("iframe");
    frame.name=`displayCheckUploadFrame_${token.replace(/[^a-z0-9_]/gi,"")}`;
    frame.title="진열 연출 사진 전송";
    frame.style.display="none";
    document.body.appendChild(frame);
    const timer = setTimeout(()=>{
      displayCheckUploadResolvers.delete(token);
      try{ frame.remove(); }catch(e){}
      const error = new Error("업로드 응답 시간이 지연되어 서버 저장 여부를 다시 확인합니다.");
      error.uploadToken = token;
      reject(error);
    },120000);
    displayCheckUploadResolvers.set(token,{resolve,reject,timer,frame});
    const form=document.createElement("form");
    form.method="POST";
    form.action=CONFIG.APPS_SCRIPT_URL;
    form.target=frame.name;
    form.style.display="none";
    const values={action:"uploadDisplayCheckPhoto",uploadToken:token,...payload};
    Object.entries(values).forEach(([name,value])=>{
      const input=document.createElement(name==="imageData"?"textarea":"input");
      if(input.tagName==="INPUT") input.type="hidden";
      input.name=name;
      input.value=String(value??"");
      form.appendChild(input);
    });
    document.body.appendChild(form);
    try{ form.submit(); }
    catch(err){
      clearTimeout(timer);displayCheckUploadResolvers.delete(token);form.remove();frame.remove();reject(err);return;
    }
    setTimeout(()=>form.remove(),1500);
  });
}

function openDisplayCheckPreview(code){
  const state=displayCheckState.get(code)||{};
  const url=state.previewUrl||state.imageUrl||"";
  const item=displayCheckItems().find(x=>x.code===code);
  if(url) openImageModal([url],0,`${item?.title || "촬영"} 사진`);
}

