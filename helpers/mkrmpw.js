//임시비밀번호 발송
makeRandomPassword = () => {

    var value1 = "", value2 = "", value3 = '', value4 ='', randomPassword = '';
  
    var special_length = 2;
    var special = "!@#$";
    var big = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
    var big_length = 4;
    var number = "0123456789";
    var number_length = 2;
    var small = "abcdefghiklmnopqrstuvwxyz";
    var small_length = 4;
  
    for( var i=0; i < special_length; i++ ){
      value1 += special.charAt(Math.floor(Math.random() * special.length));
    };
  
    for (var i = 0; i < big_length; i++) {
      var rnum = Math.floor(Math.random() * big.length);
      value2 += big.substring(rnum, rnum + 1);
    };
  
    for( var i=0; i < number_length; i++ ){
      value1 += number.charAt(Math.floor(Math.random() * number.length));
    };
  
    for( var i=0; i < small_length; i++ ){
      value1 += small.charAt(Math.floor(Math.random() * small.length));
    };
  
    randomPassword = value1+value2+value3+value4;
  
    // 문자열 섞기
    String.prototype.shuffle = function () {
      var a = this.split(""),
          n = a.length;
  
      for(var i = n - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = a[i];
          a[i] = a[j];
          a[j] = tmp;
      }
      return a.join("");
  }
  
    return randomPassword.shuffle();

  };


  module.exports = makeRandomPassword();