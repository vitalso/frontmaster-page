$(document).ready(function(){

  //////////
  // Global variables
  //////////

  var _window = $(window);
  var _document = $(document);

  ////////////
  // READY - triggered when PJAX DONE
  ////////////
  function pageReady(){
    legacySupport();
    initHeaderScroll();

    initPopups();
    initSliders();
    initScrollMonitor();
    initMasks();
  }

  // this is a master function which should have all functionality
  pageReady();

  // swiper fix for destroy
  _window.on('resize', debounce(initScrollMonitor, 300))

  //////////
  // COMMON
  //////////

  function legacySupport(){
    // svg support for laggy browsers
    svg4everybody();

    // Viewport units buggyfill
    window.viewportUnitsBuggyfill.init({
      force: false,
      refreshDebounceWait: 150,
      appendToBody: true
    });
  }

  // Examples work compare(before/after)
  $('.slide__compare').twentytwenty({
    no_overlay: true
  })


  // Prevent # behavior
	_document
    .on('click', '[href="#"]', function(e) {
  		e.preventDefault();
  	})
    .on('click', '.header__menu a', function() {
      closeMobileMenu();
      var el = $(this).attr('href');
      // $(this).parent().siblings().find('a').removeClass('active-link');
      // $(this).addClass('active-link');
      $('body, html').animate({
          scrollTop: $(el).offset().top}, 1000);
      return false;
    })
    .on('click', '.mobile-navi__menu a', function(){
      closeMobileMenu();
      var el = $(this).attr('href');
      // $(this).parent().siblings().find('a').removeClass('active-link');
      // $(this).addClass('active-link');
      $('body, html').animate({
          scrollTop: $(el).offset().top - $('.header').height()}, 1000);
      return false;
    })


  // HEADER SCROLL
  // add .header-static for .page or body
  // to disable sticky header
  function initHeaderScroll(){
    _window.on('scroll', throttle(function(e) {
      var vScroll = _window.scrollTop();
      var header = $('.header').not('.header--static');

      if ( vScroll > 20 ){
        header.addClass('is-fixed');
      } else {
        header.removeClass('is-fixed');
      }

    }, 10));
  }

  // UPDATE HEADER MENU ANCHORS
  // Cache selectors
  var topMenu = $(".header__menu"),
  // All list items
  menuItems = topMenu.find("a"),
  // Anchors corresponding to menu items
  scrollItems = menuItems.map(function(){
    var item = $($(this).attr("href"));
    if ( item.length ) { return item; }
  });

  // Bind to scroll
  _window.on('scroll', throttle(function(){
    // Get container scroll position
    var topMenuHeight = topMenu.outerHeight()
    var fromTop = $(this).scrollTop() + 1;

    // Get id of current scroll item
    var cur = scrollItems.map(function(){
     if ($(this).offset().top < fromTop)
       return this;
    });
    // Get the id of the current element
    cur = cur[cur.length-1];
    var id = cur && cur.length ? cur[0].id : "";
    // Set/remove active class
    menuItems.removeClass("active-link").filter("[href='#"+id+"']").addClass("active-link");
  }, 20));



  var preventKeys = {
    37: 1, 38: 1, 39: 1, 40: 1
  };

  function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
      e.preventDefault();
    e.returnValue = false;
  }

  function preventDefaultForScrollKeys(e) {
    if (preventKeys[e.keyCode]) {
      preventDefault(e);
      return false;
    }
  }

  function disableScroll() {
    var target = $('body').get(0)
    if (window.addEventListener) // older FF
      target.addEventListener('DOMMouseScroll', preventDefault, false);
    target.onwheel = preventDefault; // modern standard
    target.onmousewheel = target.onmousewheel = preventDefault; // older browsers, IE
    target.ontouchmove = preventDefault; // mobile
    target.onkeydown = preventDefaultForScrollKeys;

    console.log('disabled')
  }

  // function bindOverflowScroll(){
  //   var $menuLayer = $(".menu-box");
  //   $menuLayer.bind('touchstart', function (ev) {
  //       var $this = $(this);
  //       var layer = $menuLayer.get(0);
  //
  //       if ($this.scrollTop() === 0) $this.scrollTop(1);
  //       var scrollTop = layer.scrollTop;
  //       var scrollHeight = layer.scrollHeight;
  //       var offsetHeight = layer.offsetHeight;
  //       var contentHeight = scrollHeight - offsetHeight;
  //       if (contentHeight == scrollTop) $this.scrollTop(scrollTop-1);
  //   });
  // }
  // bindOverflowScroll();
  // var container = document.querySelector('.menu-box');
  // var ps = new PerfectScrollbar(container);


  function enableScroll() {
    var target = $('body').get(0)
    if (window.removeEventListener)
      target.removeEventListener('DOMMouseScroll', preventDefault, false);
    target.onmousewheel = target.onmousewheel = null;
    target.onwheel = null;
    target.ontouchmove = null;
    target.onkeydown = null;
  }

  function blockScroll(unlock) {
    if ($('[js-hamburger]').is('.is-active')) {
      disableScroll();
    } else {
      enableScroll();
    }
    if (unlock) {
      enableScroll();
    }
  };


  // HAMBURGER TOGGLER
  _document.on('click', '[js-hamburger]', function(){
    $(this).toggleClass('is-active');
    $('.header').toggleClass('is-blue');
    $('.mobile-navi').toggleClass('is-active');
    blockScroll();
  });

  function closeMobileMenu(){
    $('[js-hamburger]').removeClass('is-active');
    $('.header').removeClass('is-blue');
    $('.mobile-navi').removeClass('is-active');
    blockScroll(true);
  }


  //////////
  // CALCULATE LOGIC
  //////////
  function numberWithSpace(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  // $.fn.digits = function(){
  //   return this.each(function(){
  //     $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") );
  //   })
  // }

  var curCalcPrice, curCreditPrice

  $('[js-calculateForm]').on('change', function(e){
    var $form = $(this);
    var calcPrice = $form.find('.form__result-title i')
    var calcCreditPrice = $form.find('.form__result-subtitle i')

    var calcType = $form.find('select[name="house"]').val()
    var calcSquare = $form.find('input[name="square"]').val()
    var calcMaterial = $form.find('select[name="material"]').val()
    var calcWarming = $form.find('input[name="warming"]').is(':checked')

    var basePrice = 1000 // rub, per square meter
    var yearlyInterest = 14 // percent
    var resultPrice = basePrice

    // first up for saved numbers
    curCalcPrice = parseInt(calcPrice.html().replace(/ /g, ''))
    curCreditPrice = parseInt(calcCreditPrice.html().replace(/ /g, ''))

    // console.log(
    //   'calcType', calcType,
    //   'calcSquare', calcSquare,
    //   'calcMaterial', calcMaterial,
    //   'calcWarming', calcWarming
    // )

    if ( calcType == "Загородный дом" ){
      resultPrice = resultPrice + 500
    } else if ( calcType == "Котедж" ){
      resultPrice = resultPrice + 1000
    } else if ( calcType == "Вилла" ){
      resultPrice = resultPrice + 2500
    } else if ( calcType == "Особняк" ){
      resultPrice = resultPrice + 5000
    }

    if ( calcMaterial == "Дерево" ){
      resultPrice = resultPrice + 400
    } else if ( calcMaterial == "Кирпич" ){
      resultPrice = resultPrice + 250
    } else if ( calcMaterial == "Штукатурка" ){
      resultPrice = resultPrice + 150
    }


    if ( calcSquare > 0 ){
      resultPrice = resultPrice * Math.abs(calcSquare)
    }

    // bouns price for volume ?
    if ( calcSquare > 100) {
      resultPrice = resultPrice * 0.85
    }
    if ( calcSquare > 200) {
      resultPrice = resultPrice * 0.8
    }

    if (calcWarming){
      resultPrice = resultPrice + 5000
    }

    // update html
    var creditPrice = Math.floor((resultPrice * (1 + (yearlyInterest/100))) / 12)

    console.log(curCalcPrice, resultPrice)
    calcPrice.prop('Counter',curCalcPrice).animate({
      Counter: resultPrice
    }, {
      duration: 600,
      easing: 'swing',
      step: function (now) {
        $(this).html(numberWithSpace(Math.floor(now)));
      }
    });

    calcCreditPrice.prop('Counter',curCreditPrice).animate({
      Counter: creditPrice
    }, {
      duration: 600,
      easing: 'swing',
      step: function (now) {
        $(this).html(numberWithSpace(Math.floor(now)));
      }
    });


  })


  //////////
  // SLIDERS
  //////////

  function initSliders(){
    var slickNextArrow = '<button type="button" class="slick-next"><i class="icon icon-arrow-right"></i></button>';
    var slickPrevArrow = '<button type="button" class="slick-prev"><i class="icon icon-arrow-left"></i></button>'

    // other individual sliders goes here

    // Materials carousel
    var materialsSwiperOptions = {
      wrapperClass: "swiper-wrapper",
      slideClass: "materials__item",
      direction: 'horizontal',
      slidesPerView: 5,
      spaceBetween: 0,
      watchOverflow: true,
      freeMode: false,
      // Responsive breakpoints
      navigation: {
        nextEl: '.material-next',
        prevEl: '.material-prev',
      },
      breakpoints: {
        // works as max-width prop
        568: {
          slidesPerView: 1
        },
        768: {
          slidesPerView: 2
        },
        992: {
          slidesPerView: 3
        },
        1100: {
          slidesPerView: 4
        }
      }
    }

    var swiperMaterials = undefined

    function checkSwiperMaterials(){
      if ( _window.width() < 568 && swiperMaterials !== undefined) {
        swiperMaterials.destroy();
        swiperMaterials = undefined
      } else if ( _window.width() > 568 && swiperMaterials === undefined ) {
        swiperMaterials = new Swiper ('.materials__carousel', materialsSwiperOptions)
      }
    }

    _window.on('resize', debounce(checkSwiperMaterials, 300));
    checkSwiperMaterials();


    var iconBreakpoints = {
      375: {
        slidesPerView: 1,
        spaceBetween: 0
      },
      480: {
        slidesPerView: 2,
        spaceBetween: 0
      },
      568: {
        slidesPerView: 3,
        spaceBetween: 20
      },
      768: {
        slidesPerView: 4,
        spaceBetween: 20
      }
    }
    // Why carousel
    var swiperWhy = new Swiper ('.why__carousel', {
      wrapperClass: "swiper-wrapper",
      slideClass: "why__item",
      direction: 'horizontal',
      loop: false,
      watchOverflow: true,
      // setWrapperSize: true,
      spaceBetween: 0,
      slidesPerView: 5,
      // loop: true,
      normalizeSlideIndex: true,
      // centeredSlides: true,
      freeMode: false,
      navigation: {
        nextEl: '.why-next',
        prevEl: '.why-prev',
      },
      // Responsive breakpoints
      breakpoints: iconBreakpoints
    })

    // Steps of work carousel
    var swiperSteps = new Swiper ('.steps__carousel', {
      wrapperClass: "swiper-wrapper",
      slideClass: "why__item",
      direction: 'horizontal',
      // loop: true,
      watchOverflow: true,
      // setWrapperSize: true,
      slidesPerView: 5,
      spaceBetween: 0,
      // loop: true,
      // normalizeSlideIndex: true,
      // centeredSlides: true,
      freeMode: false,
      navigation: {
        nextEl: '.steps-next',
        prevEl: '.steps-prev',
      },
      // Responsive breakpoints
      breakpoints: iconBreakpoints
    })

    // Credit carousel
    var creditSwiperOptions = {
      wrapperClass: "swiper-wrapper",
      slideClass: "why__item",
      direction: 'horizontal',
      watchOverflow: true,
      loop: true,
      slidesPerView: 'auto',
      navigation: {
        nextEl: '.credit-next',
        prevEl: '.credit-prev',
      },
      // Responsive breakpoints
      breakpoints: {
        375: {
          slidesPerView: 1,
          spaceBetween: 10
        },
        480: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        786: {
          slidesPerView: 3,
          spaceBetween: 20
        }
      }
    }

    var swiperCredit = undefined

    function checkSwiperCredit(){
      if ( _window.width() > 767 && swiperCredit !== undefined) {
        swiperCredit.destroy();
        swiperCredit = undefined
      } else if ( _window.width() < 767 && swiperCredit === undefined ) {
        swiperCredit = new Swiper ('.credit__carousel', creditSwiperOptions)
      }
    }

    _window.on('resize', debounce(checkSwiperCredit, 300));
    checkSwiperCredit();


    // work example carousel
    var swiperWork = new Swiper ('.works__example', {
      wrapperClass: "swiper-wrapper",
      slideClass: "works__example-slide",
      direction: 'horizontal',
      watchOverflow: true,
      slidesPerView: 4,
      loop: true,
      spaceBetween: 30,
      noSwipingClass: "slide__compare",
      navigation: {
        nextEl: '.works-next',
        prevEl: '.works-prev',
      },
      // Responsive breakpoints
      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 20
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        1150: {
          slidesPerView: 3,
          spaceBetween: 20
        }
      }
    });

    // Review carousel
    var swiperTestimonials = new Swiper ('.reviews__carousel', {
      wrapperClass: "swiper-wrapper",
      slideClass: "reviews__carousel-item",
      direction: 'horizontal',
      watchOverflow: true,
      slidesPerView: 3,
      loop: true,
      spaceBetween: 25,
      navigation: {
        nextEl: '.reviews-next',
        prevEl: '.reviews-prev',
      },
      // Responsive breakpoints
      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 20
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        992: {
          slidesPerView: 2,
          spaceBetween: 20
        }
      }
    });

  }

  // Accordion for materials om mobile
  $('.materials__item').on('click' , function(e){
    if ( e.target.closest('.materials__arrow') ){
      return;
    }
    if ( _window.width() < 568 ){
      $('.materials__item').not($(this)).removeClass('is-show');
      $(this).addClass('is-show');
    }
  });

  $('.materials__arrow').on('click', function(){
    if ( _window.width() < 568 ){
      $('.materials__item').not($(this).closest('.materials__item')).removeClass('is-show');
      $(this).closest('.materials__item').toggleClass('is-show');
    }
  })

  _window.on('resize', debounce(function(){
    if ( _window.width() > 568 ){
      $('.materials__item').removeClass('is-show');
    }
  }, 300));

  //////////
  // MODALS
  //////////

  function initPopups(){
    // Magnific Popup
    var mfpCloseBtn = '<button class="mfp-close"><svg class="ico ico-close"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="img/sprite.svg#ico-close"></use></svg></button>'

    // video play
    $('.review__play').magnificPopup({
      // disableOn: 700,
      type: 'iframe',
      fixedContentPos: true,
      fixedBgPos: true,
      overflowY: 'auto',
      closeBtnInside: false,
      preloader: false,
      midClick: true,
      removalDelay: 300,
      mainClass: 'popup-fade',
      patterns: {
        youtube: {
          index: 'youtube.com/',
          id: 'v=', // String that splits URL in a two parts, second part should be %id%
          src: '//www.youtube.com/embed/%id%?autoplay=1&controls=0&showinfo=0' // URL that will be set as a source for iframe.
        }
      },
      closeMarkup: mfpCloseBtn
    });


    // Popup callback
    $('.contact-callback , .personal__data , .detail').magnificPopup({
      type: 'inline',
      fixedContentPos: true,
      fixedBgPos: true,
      overflowY: 'auto',
      closeBtnInside: true,
      preloader: false,
      midClick: true,
      mainClass: 'popup-fade',
      removalDelay: 300,
      closeMarkup: mfpCloseBtn
    });
  }

  $('.mfp-close').on('click', closeMfp)

  function closeMfp(){
    console.log('cliso')
    $.magnificPopup.close();
  }

  ////////////
  // UI
  ////////////

  // Select
  $('select').selectric();

  // textarea autoExpand
  _document
    .one('focus.autoExpand', '.ui-group textarea', function(){
        var savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        this.value = savedValue;
    })
    .on('input.autoExpand', '.ui-group textarea', function(){
        var minRows = this.getAttribute('data-min-rows')|0, rows;
        this.rows = minRows;
        rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 17);
        this.rows = minRows + rows;
    });

  // Masked input
  function initMasks(){
    $("[js-dateMask]").mask("99.99.99",{placeholder:"ДД.ММ.ГГ"});
    $("input[type='tel']").mask("+7 (000) 000-0000", {placeholder: "+7 (___) ___-____"});
  }


  ////////////
  // SCROLLMONITOR - WOW LIKE
  ////////////
  function initScrollMonitor(){
    $('.wow').each(function(i, el){

      var elWatcher = scrollMonitor.create( $(el) );

      var delay;
      if ( $(window).width() < 768 ){
        delay = 0
      } else {
        delay = $(el).data('animation-delay');
      }

      var animationClass = $(el).data('animation-class') || "wowFadeUp"

      var animationName = $(el).data('animation-name') || "wowFade"

      elWatcher.enterViewport(throttle(function() {
        $(el).addClass(animationClass);
        $(el).css({
          'animation-name': animationName,
          'animation-delay': delay,
          'visibility': 'visible'
        });
      }, 150, {
        'leading': true
      }));
      // uncomment if you want fadeOut effect on scrollOut

      // elWatcher.exitViewport(throttle(function() {
      //   $(el).removeClass(animationClass);
      //   $(el).css({
      //     'animation-name': 'none',
      //     'animation-delay': 0,
      //     'visibility': 'hidden'
      //   });
      // }, 100));
    });

  }

  // Google Maps API
  function initMap() {
    var coordinates = {lat: 55.807846, lng: 37.512125},

        map = new google.maps.Map(document.getElementById('map'), {
            center: coordinates,
            zoom: 16,
            disableDefaultUI: true,
            scrollwheel: false,
            zoomControl: _window.width() > 568 ? true : false,
        }),

        image = 'img/map-marker.png',
        marker = new google.maps.Marker({
            position: coordinates,
            map: map,
            icon: image
        });
  }

  initMap();

});
