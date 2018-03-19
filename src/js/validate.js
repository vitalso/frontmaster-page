$(document).ready(function(){
  ////////////////
  // FORM VALIDATIONS
  ////////////////

  // jQuery validate plugin
  // https://jqueryvalidation.org


  // GENERIC FUNCTIONS
  ////////////////////

  var validateErrorPlacement = function(error, element) {
    error.addClass('ui-input__validation');
    error.appendTo(element.parent("div"));
  }
  var validateHighlight = function(element) {
    $(element).parent('div').addClass("has-error");
  }
  var validateUnhighlight = function(element) {
    $(element).parent('div').removeClass("has-error");
  }
  var validateSubmitHandler = function(form) {
    $(form).addClass('loading');

    // DO SOME AJAX MAGIC HERE
    // $.ajax({
    //   type: "POST",
    //   url: $(form).attr('action'),
    //   data: $(form).serialize(),
    //   success: function(response) {
    //     $(form).removeClass('loading');
    //     var data = $.parseJSON(response);
    //     if (data.status == 'success') {
    //       // do something I can't test
    //     } else {
    //         $(form).find('[data-error]').html(data.message).show();
    //     }
    //   }
    // });

    console.log('submit handler')
    // show sucess modal
    var mfpCloseBtn = '<button class="mfp-close"><svg class="ico ico-close"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="img/sprite.svg#ico-close"></use></svg></button>'

    $.magnificPopup.open({
      items: {
        src: $('#success')
      },
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

  var validatePhone = {
    required: true,
    normalizer: function(value) {
        var PHONE_MASK = '+X (XXX) XXX-XXXX';
        if (!value || value === PHONE_MASK) {
            return value;
        } else {
            return value.replace(/[^\d]/g, '');
        }
    },
    minlength: 11,
    digits: true
  }

  ////////
  // FORMS

  // Banner form
  $(".banner__form").validate({
    errorPlacement: validateErrorPlacement,
    highlight: validateHighlight,
    unhighlight: validateUnhighlight,
    submitHandler: validateSubmitHandler,
    rules: {
      phone: validatePhone,
      agree_1: "required"
    },
    messages: {
      phone: {
        required: "Введите номер телефона",
        minlength: "Введите корректный телефон"
      },
      agree_1: "Вы должны принять условия"
    }
  });

  // Calculate form
  $(".calculate__form").validate({
    errorPlacement: validateErrorPlacement,
    highlight: validateHighlight,
    unhighlight: validateUnhighlight,
    submitHandler: validateSubmitHandler,
    rules: {
      house: "required",
      square: "required",
      material: "required",
      agree_2: "required"
    },
    messages: {
      house: "Выбирите тип дома",
      square: "Введите площадь дома",
      material: "Выбирите метериал",
      agree_2: "Вы должны принять условия"
    }
  });

  // Project form
  $(".project__cta-form").validate({
    errorPlacement: validateErrorPlacement,
    highlight: validateHighlight,
    unhighlight: validateUnhighlight,
    submitHandler: validateSubmitHandler,
    rules: {
      phone: validatePhone
    },
    messages: {
      phone: {
        required: "Введите номер телефона",
        minlength: "Введите корректный телефон"
      }
    }
  });

  // modal callback
  $(".callback__form").validate({
    errorPlacement: validateErrorPlacement,
    highlight: validateHighlight,
    unhighlight: validateUnhighlight,
    submitHandler: validateSubmitHandler,
    rules: {
      name: "required",
      phone: validatePhone,
      agree_3: "required"
    },
    messages: {
      name: "Заполните это поле",
      phone: {
        required: "Введите номер телефона",
        minlength: "Введите корректный телефон"
      },
      agree_3: "Вы должны принять условия"
    }
  });

  // modal details
  $(".detail__form").validate({
    errorPlacement: validateErrorPlacement,
    highlight: validateHighlight,
    unhighlight: validateUnhighlight,
    submitHandler: validateSubmitHandler,
    rules: {
      name: "required",
      phone: validatePhone,
      email: {
        required: true,
        email: true
      },
      agree_4: "required"
    },
    messages: {
      name: "Заполните это поле",
      email: {
        required: "Заполните это поле",
        email: "Email содержит неправильный формат"
      },
      phone: {
        required: "Введите номер телефона",
        minlength: "Введите корректный телефон"
      },
      agree_4: "Вы должны принять условия"
    }
  });


  /////////////////////
  // REGISTRATION FORM
  ////////////////////
  // $(".js-registration-form").validate({
  //   errorPlacement: validateErrorPlacement,
  //   highlight: validateHighlight,
  //   unhighlight: validateUnhighlight,
  //   submitHandler: validateSubmitHandler,
  //   rules: {
  //     last_name: "required",
  //     first_name: "required",
  //     email: {
  //       required: true,
  //       email: true
  //     },
  //     password: {
  //       required: true,
  //       minlength: 6,
  //     }
  //     // phone: validatePhone
  //   },
  //   messages: {
  //     last_name: "Заполните это поле",
  //     first_name: "Заполните это поле",
  //     email: {
  //         required: "Заполните это поле",
  //         email: "Email содержит неправильный формат"
  //     },
  //     password: {
  //         required: "Заполните это поле",
  //         email: "Пароль мимимум 6 символов"
  //     },
  //     // phone: {
  //     //     required: "Заполните это поле",
  //     //     minlength: "Введите корректный телефон"
  //     // }
  //   }
  // });

});
