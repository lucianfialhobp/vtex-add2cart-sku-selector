;(function ($, window, document, undefined) {
  $.fn.vtex_add2cart_sku_selector = function (opts) {
    var _this = this;

    var _s = $.extend({
      classes: null,
      callback: null
    }, opts);

    var _p = {
      id: null,
      init: function () {
        if (_p.check.selector())
          _p.load.scripts();
      },
      load: {
        scripts: function () {
          if (typeof apply_sku_selection != "function")
            $.getScript("/arquivos/vtex_skupack.min.js", _p.load.popup);
          else
            _p.load.popup();
        },
        popup: function () {
          if (typeof $.fn.vtex_popup != "function")
            $.getScript("/arquivos/vtex_popup.js", _p.set.event.click);
          else
            _p.set.event.click();
        }
      },
      set: {
        event: {
          click: function () {

            if (_this.not(".vacss").length <= 0) return false;

            var clicked = function (e) {
              _p.id = $(e).attr("idproduct");
              _p.show.popup();
            }

            _this.not(".vacss").addClass("vacss").click(function () {
              clicked(this);
            });

          },
          buy_button: function () {
            if ($(".buy-button").not(".fixed").length <= 0) return false;

            var show_success = function(){
                var div_success = jQuery("<div>").addClass('info-success').hide().text('Produto adicionado ao carrinho com sucesso!');
                jQuery(".product-info-container").prepend(div_success);
                div_success.fadeIn("slow").delay(4000).fadeOut("fast");
            }

            $(".buy-button").not(".fixed").addClass("fixed").click(function () {
              var valid = _p.check.valid();
              if (valid) {
                var href = $(this).attr("href");
                if (href) {
                  show_success();
                  _p.add2cart(href);
                }
              }
              return false; // prevent button default action (redirect)
            });
          }
        }
      },
      add2cart: function (href) {
        if (!href) return false;

        var opt = {
          url: href,
          success: function (data) {
            // data
            if (typeof _s.callback === "function")
              _s.callback();
          }
        };
        $.ajax(opt);
      },
      show: {
        popup: function () {
          if (!_p.id) return false;
          var opt = {
            url: "/skulist?idproduto=" + _p.id,
            dataType: "text",
            success: function (data) {
              var r,s;
              r = $(data).find(".product-info-container");
              s = data.replace(/(?:[\S\s]*?)myJSONSkuSpecification(?:.*?)({.*?)\<.+([\S\s]*)/, "$1");
              if(typeof s==="string"&&s[0]==="{") {
                window.myJSONSkuSpecification = (new Function('return ' + s))();
                $(r).vtex_popup({
                  title: 'Adicionar ao Carrinho',
                  classes: _s.classes
                });
                window.apply_sku_selection();
                _p.set.event.buy_button();
              } else {
                // 1 sku
                s = data.replace(/(?:[\S\s]*?)vtxctx\.skus(?:.*?)(\d+?)['|"].*([\S\s]*)/, "$1");
                var url = "/no-cache/CarrinhoAdd.aspx?quantidade=1&idSku="+s;
                _p.add2cart(url);
              }
              //_p.log("Um erro ocorreu ao tentar capturar o sku.");
            }
          }
          $.ajax(opt);
        }
      },
      check: {
        selector: function () {
          var exists = _this.length;

          if (!exists) // This checks if the container is set. Otherwise, nothing will happen.
            _p.log("A selection is required.");

          return exists;
        },
        valid: function () {
          return true;
        }
      },
      log: function (log) {
        if (typeof console == "undefined") return false;

        console.log(log);
        return true;
      }
    };

    return _p.init();

  };

})(jQuery, window, document);