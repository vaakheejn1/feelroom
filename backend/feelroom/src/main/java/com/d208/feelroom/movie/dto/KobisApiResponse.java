package com.d208.feelroom.movie.dto;

import lombok.Data;

import java.util.List;

@Data
public class KobisApiResponse {
    private BoxOfficeResult boxOfficeResult;

    @Data
    public static class BoxOfficeResult {
        private String boxofficeType;
        private String showRange;
        private List<DailyBoxOffice> dailyBoxOfficeList;
    }

    @Data
    public static class DailyBoxOffice {
        private String rnum; // 순번
        private String rank; // 해당일자의 박스오피스 순위
        private String rankInten; // 전일대비 순위의 증감분
        private String rankOldAndNew; // 랭킹에 신규진입여부
        private String movieCd; // 영화 대표코드
        private String movieNm; // 영화명
        private String openDt; // 개봉일
        private String salesAmt; // 해당일자 매출액
        private String salesShare; // 해당일자 전체 매출액 대비 해당 영화 매출액의 비율
        private String salesInten; // 전일대비 매출액 증감분
        private String salesChange; // 전일대비 매출액 증감률
        private String salesAcc; // 누적매출액
        private String audiCnt; // 해당일의 관객수
        private String audiInten; // 전일대비 관객수 증감분
        private String audiChange; // 전일대비 관객수 증감률
        private String audiAcc; // 누적관객수
        private String scrnCnt; // 해당일자에 상영된 스크린 수
        private String showCnt; // 해당일자에 상영된 횟수
    }
}
