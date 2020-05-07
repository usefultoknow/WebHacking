const xssFilter = require('xssfilter'),
      xssFilters = require('xss-filters');

/*
module.exports = function XSSFilter(content) {
    var Content = content.replace(/</g, "&lt;");
    var value = Content.replace(/>/g, "&gt;");
    return value;
  }
*/

const Protection = {};

// ############################################### XSS 문자열 치환
Protection.cleanXss = (value) => {
    if(value == "" || value == null){
        throw new Error('value is empty');
    }
    /*
    value = value.replaceAll("&", "&amp;");
    value = value.replaceAll("\"", "&quot;");
    value = value.replaceAll("'", "&apos;");
    value = value.replaceAll("<", "&lt;");
    value = value.replaceAll(">", "&gt;");
    value = value.replaceAll("\r", "<br>");
    value = value.replaceAll("\n", "<p>");
    */
    value = value.replace(/&/gi, "&amp;");
    value = value.replace(/\"/gi, "&quot;");
    value = value.replace(/'/gi, "&apos;");
    value = value.replace(/</gi, "&lt;");
    value = value.replace(/>/gi, "&gt;");
    value = value.replace(/\r/gi, "<br>");
    value = value.replace(/\n/gi, "<p>");
    value = value.replace(/-/gi, "");   // 임시 추가 (2020.04.06 - 상준- => 전화번호 입력할 때 "-" 빼는 용도)

    return value;
}




// ################################################# 생년월일 유효성 검사
Protection.checkBirth = (value) => {
    var birthRule = /^(19[0-9][0-9]|20\d{2})(0[0-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/;
        
    if(value == "" || value == null){
        throw new Error("birthday value is empty");
    }
    if(birthRule.test(value) == false){
        throw new Error("birthday is not valid");
    }
    return value;
}


// ################################################# 이메일 유효성 검사
// userRoute에서 438번째 줄인 로그인 부분에서 로그인 할 때 이메일 값에 아무 값도 안 넣으면 오류가 잘 반환된다. 너무 잘 반환된다. 서버 내부 경로도 몽땅....
Protection.checkEmail = (value) => {
    // 이메일 검사 정규식
    let checkRule = /^[a-z0-9_+.-]+@([a-z0-9-]+\.)+[a-z0-9]{2,4}$/;

    // 만약 값이 없으면 에러 throw
    if (value == "" || value == null) {
        throw new Error("email value is empty");
    }

    // ** 문자열의 공백 없애기
    value = value.replace(/\s/gi, "");

    // 만약 이메일형식에 안맞는거면 에러 throw
    if (!checkRule.test(value)) {
        throw new Error("Email data is not valid");
    }
    return value;

}





// ** 한계도 검사해야함 65500 이하만 
// ################################################## 숫자 유효성 검사
Protection.checkNumber = (value) => {

    let number = /^[0-9]*$/;

    if (value == null || value == "") {
        throw new Error("There is no value");
    }
    if (value < 0 || value > 65500) {
        throw new Error("Amount is not available");
    }
    if (number.test(value) == false) {
        throw new Error(`Number is not valid`);
    }
    return value;
};




// ################################################## 비밀번호 유효성 검사 모듈
// 에로사항 : 특수문자, 숫자, 대문자, 소문자가 각각 적어도 1번 이상씩 포함되게 할건데 이렇게 했을 경우 길이만 맞으면 한종류만으로 구성된 비밀번호가 생길 수 있다.  ex) 12345678 or qwerqwer
// 원하는 방식으로 하면 주석으로 되어있는 부분이다
Protection.checkPassword = (value) => {
    
    if (value == null || value == "") {
        throw new Error("There is no value");
    }
    // ** 문자열의 공백 없애기
    value = value.replace(/\s/gi, "");

    // ** 문자열 길이 지정하기
    let strLength = value.length >= 8 && value.length <= 20;

    // ** 허용되는 문자 정하기
    var uppercase = /[A-Z]/;
    var lowercase = /[a-z]/;
    var number = /[0-9]/;
    var special = /[`~!@#$%^&*|\\\'\";:\/?]/;
    // let reg = /^[a-zA-Z0-9`~!@#$%^&*|\\\'\";:\/?]*$/;



    if (strLength == false || uppercase.test(value) == false || lowercase.test(value) == false || number.test(value) == false || special.test(value) == false) {
        throw new Error(`Password data is not valid`);
    }

    return value;
};

// ################################################## _id 값 검사
Protection.checkID = (value) => {

    let number = /^[0-9a-z]*$/;

    if (value == null || value == "") {
        throw new Error("There is no value");
    }
    if (number.test(value) == false) {
        throw new Error(`${value} is not valid`);
    }
    return value;
};

// ################################################## CODE 값 검사
Protection.checkCODE = (value) => {

    let code = /^[0-9A-Z]*$/;
    value = value.toUpperCase();    // 소문자를 대문자로 치환

    if (value == null || value == "") {
        throw new Error("There is no value");
    }

    if (code.test(value) == false) {
        throw new Error(`${value} is not valid`);
    }
    return value;
};

// 아예 "입력 가능한 문자열"로 하나의 함수를 만들어놓고 거기에서 Injection 공격이나 TypeError 등등 막은 다음에 유효성은 다른 함수에서 검사하는 식으로 할까..
// 그러면 검사를 2번 하게 되는 식...
// 화이트리스트 방식으로 할지 블랙리스트 방식으로 할지...

// 블랙리스트 방식 문제점
// 만약 우리 쪽에서 블랙리스트로 지정된 특수문자가 사용자는 이메일에 포함시켜서 사용하고 있었다면??
// 사용자의 이메일 업체는 그 특수문자를 허용한다면??
// 우리쪽에서 회원가입할때 유효성 검사를 할텐데 사용자는 이미 사용하고 있는 메일이라서 적었으나 우리쪽에서는 블랙리스트 특수문자가 포함된 이메일이라면 에로사항이 생긴다.







module.exports = Protection;