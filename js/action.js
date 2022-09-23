$(document).ready(function () {
  var $star = $('.star');
  var $circle = $('.circle');
  var $square = $('.square');
  var screenConfig = {
    opening: {
      duration: 5
    }
  }
  $('.selfPage').hide();
  opening();
  
  function opening() {
    TweenLite.to($star, screenConfig.opening.duration, { rotation: 360, ease: Power2.easeOut });
    TweenLite.to($circle, screenConfig.opening.duration, { rotation: 360, ease: Power2.easeOut });
    TweenLite.to($square, screenConfig.opening.duration, { rotation: -360, ease: Power2.easeOut });

    TweenLite.to($circle, screenConfig.opening.duration / 2, { css: { scale: 1.1 } });
    TweenLite.to($circle, screenConfig.opening.duration / 2, { css: { scale: 1 }, delay: screenConfig.opening.duration / 2 });

    TweenLite.to($square, 1.6, { css: { scale: 7 }, ease: Power2.easeOut, delay: screenConfig.opening.duration - 1 });
    TweenLite.to($circle, 1.6, { css: { scale: 7 }, ease: Power2.easeOut, delay: screenConfig.opening.duration - 1 + 0.3 });
    TweenLite.to($star, 0.6, {
      css: { scale: 7 }, ease: Power2.easeOut, delay: screenConfig.opening.duration - 1 + 0.6, onComplete: () => {
        $('.opening').remove();
        $('.selfPage').show().animate({ opacity: 1 }, 2000);
        $('.textBlock').animate({ opacity: 0 }, 500);
      }
    });
  }

});