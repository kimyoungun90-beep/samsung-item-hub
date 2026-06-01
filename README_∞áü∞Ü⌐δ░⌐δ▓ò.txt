[코스트코 아이템 운영 HUB v41 적용 방법]

1. index.html / sw.js / manifest.json / icon-192.png / icon-512.png / tv_wall_install_fee.png 파일을 GitHub Pages 저장소에 덮어쓰기
2. Apps Script의 Code.gs 교체 후 '배포 관리 > 새 버전 배포'
3. 구글시트 상품DB 헤더에 아래 컬럼 추가
   - 스펙이미지URL
4. 스펙이미지URL 한 셀에 스펙 사진 URL 여러 개 입력 가능
   - 권장: 줄바꿈으로 4개 입력
   - 콤마, 세미콜론, | 구분도 지원
5. GitHub 업로드 후 앱에서 DB 새로고침 또는 강력 새로고침

상품DB 헤더 예시
아이템번호 / 모델명 / 품목 / 상품명 / 브랜드 / 대표이미지URL / 추가이미지URL / 스펙이미지URL / 스펙 / 기능 / 행사예정일 / 벽걸이모델명 / 이전설치비용 / 철거비용 / 비용비고 / 비고 / 검색키워드 / 정렬 / 사용여부

스펙이미지URL 입력 예시
https://drive.google.com/file/d/AAAA/view
https://drive.google.com/file/d/BBBB/view
https://drive.google.com/file/d/CCCC/view
https://drive.google.com/file/d/DDDD/view

파일명 관리 예시
683628_1.png
683628_2.png
683628_3.png
683628_4.png

[v41 수정 내용]
- 스펙 사진을 GitHub 고정 파일이 아니라 구글시트 스펙이미지URL에서 불러오도록 변경
- 스펙이미지URL 한 셀에 여러 URL 입력 지원
- 스펙 버튼 클릭 시 해당 아이템의 스펙이미지URL 사진을 전체화면 슬라이드로 표시
- 캐시 버전 v41 적용


[v41 스펙 사진 업로드 방식]
- 구글드라이브 공유 링크 작업 없이 GitHub의 images 폴더에 직접 업로드 가능
- 파일명: 아이템번호_순번.png
  예) 683628_1.png / 683628_2.png / 683628_3.png / 683628_4.png
- 앱에서 스펙 버튼을 누르면 images 폴더에서 1~10번까지 자동으로 찾아서 표시
- 스펙이미지URL 칸에 주소를 넣으면 주소 방식이 우선 적용됨
