var Vtex = Vtex||{};
Vtex.JSEvents = Vtex.JSEvents||{};
Vtex.Commerce = Vtex.Commerce||{};
Vtex.Commerce.JSEvents = Vtex.Commerce.JSEvents||{};

var apply_sku_selection = function () {
    //Para resolver bug do IE com radio
    if ($.browser.msie) {
        $("*[name*='espec_']").click(function () {
            if ($(this).is("input:radio")) {
                this.blur();
                this.focus();
            }
        });
    }

    //Preparo as especificações(Skus) disponiveis
    $("*[name*='espec_']").change(function () {

        //Declaracao de variaveis
        var selectedValue = new Array(); // valores selecionados nas opções de especificacao
        var selecionaveis = new Array(); // valores com as combinações possíveis
        var especChange = '';


        var index = 0; //indice para os vetores
        //vou pegar as combinações selecionadas nas opções de especificação
        selectedValue = getSelected();

        //Caso nao tenha nenhum selecionado
        //vou habilitar todas as opções
        //alert(selectedValue[0]["name"]);
        if (selectedValue[0]["name"] === undefined) {
            enableAllOptions();
            return;
        }
        if (myJSONSkuSpecification.specifications > 1) {
            index = 0;
            var espec = new Array(selectedValue.length);
            $.each(selectedValue, function (j, dataSel) {
                especChange = dataSel.name;
                especPos = especChange.replace("espec_", "");
                var temp = "";
                $.each(myJSONSkuSpecification.combination, function (i, data) {
                    if (data[dataSel.value]) {
                        var h = 0;
                        espec[index] = new Array(data[dataSel.value].length + 1);
                        $.each(data[dataSel.value], function (k, dataEspec) {
                            if (especPos == h)
                                h++;
                            temp = "espec_" + h;
                            if (dataEspec[temp] != 'undefined') {
                                espec[index][h] = dataEspec[temp];
                            }
                            h++;
                        });
                    }
                });
                espec[index][especPos] = getValuesOptions(especChange);
                index++;
            });


            $.each(espec, function (i, data) {
                if (i == 0) {
                    $.each(data, function (j, data1) {
                        selecionaveis[j] = data1.split(",");
                    });
                }
                else {
                    $.each(data, function (j, data1) {
                        selecionaveis[j] = data1.split(",").intersect(selecionaveis[j]);
                    });
                }

            });
            for (j = 0; j < myJSONSkuSpecification.specifications; j++) {
                //Desabilitar Todos
                var temp = "*[name='espec_" + j + "']";
                if ($(temp).is("input:radio")) {
                    $(temp).each(function () {
                        $(this).attr("disabled", "disabled");
                        $("label[for='" + $(this).attr("id") + "']").removeClass("sku-picked");
                    });
                }
                else {
                    $(temp).find('option').each(function () {
                        $(this).attr("disabled", "disabled");
                    });
                    //habilitar o primeiro
                    $(temp).find('option:first').each(function () {
                        $(this).removeAttr("disabled");
                    });
                }
            }

            enableOptions(selecionaveis);
            checkSelected(selecionaveis);
        }
        else {
            for (j = 0; j < myJSONSkuSpecification.specifications; j++) {
                //retirar a classe sku-picked
                var temp = "*[name='espec_" + j + "']";
                if ($(temp).is("input:radio")) {
                    $(temp).each(function () {
                        $("label[for='" + $(this).attr("id") + "']").removeClass("sku-picked");
                    });
                }
            }
        }
        $("label[for='" + $(this).attr("id") + "']").addClass("sku-picked");
        getSku();
        notifymeOnButtomOkClick();
    });

    ImageControl($("ul.thumbs a:first"), 0);
    clickThumbs();
    var imageControlListener = new Vtex.JSEvents.Listener('imageControlListener', imageControl_OnSkuDataReceived);
    skuEventDispatcher.addListener(skuDataReceivedEventName, imageControlListener);

    var imageControlSpecSelectedListener = new Vtex.JSEvents.Listener('imageControlSpecSelectedListener', imageControl_OnSkuImageRelatedSpecSelected);
    skuEventDispatcher.addListener(skuImageRelatedSpecSelectedEventName, imageControlSpecSelectedListener);

}

// http://develop-lojasmel.vtexcommerce.com.br/Scripts/intersect.js
// #region intersect.js
    // **************************************************************************
    // Copyright 2007 - 2008 The JSLab Team, Tavs Dokkedahl and Allan Jacobs
    // Contact: http://www.jslab.dk/contact.php
    //
    // This file is part of the JSLab Standard Library (JSL) Program.
    //
    // JSL is free software; you can redistribute it and/or modify
    // it under the terms of the GNU General Public License as published by
    // the Free Software Foundation; either version 3 of the License, or
    // any later version.
    //
    // JSL is distributed in the hope that it will be useful,
    // but WITHOUT ANY WARRANTY; without even the implied warranty of
    // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    // GNU General Public License for more details.
    //
    // You should have received a copy of the GNU General Public License
    // along with this program. If not, see <http://www.gnu.org/licenses/>.
    // ***************************************************************************
    // File created 2009-01-28 10:09:31

    // Compute the intersection of n arrays
    Array.prototype.intersect =
      function() {
        if (!arguments.length)
          return [];
        var a1 = this;
        var a = a2 = null;
        var n = 0;
        while(n < arguments.length) {
          a = [];
          a2 = arguments[n];
          var l = a1.length;
          var l2 = a2.length;
          for(var i=0; i<l; i++) {
            for(var j=0; j<l2; j++) {
              if (a1[i] === a2[j])
                a.push(a1[i]);
            }
          }
          a1 = a;
          n++;
        }
        return a.unique();
      };

    // Return new array with duplicate values removed
    Array.prototype.unique =
      function() {
        var a = [];
        var l = this.length;
        for(var i=0; i<l; i++) {
          for(var j=i+1; j<l; j++) {
            // If this[i] is found later in the array
            if (this[i] === this[j])
              j = ++i;
          }
          a.push(this[i]);
        }
        return a;
      };
// #endregion

// http://develop-lojasmel.vtexcommerce.com.br/Scripts/vtex.common.js
// #region vtex.common.js
    var Class = {
        create: function () {
            /// <summary>
            /// Creates a new class definition.
            /// </summary>
            return function () {
                this.initialize.apply(this, arguments);
            };
        }
    };
    var Namespace = {
        create: function (name) {
            /// <summary>
            /// Creates a new namespace.
            /// </summary>
            /// <param name="name" type="String">
            /// Full name for the new namespace.
            /// </param>
            var chk = false;
            var cob = "";
            var spc = name.split(".");
            for (var i = 0; i < spc.length; i++) {
                if (cob != "") { cob += "."; }
                cob += spc[i];
                chk = this.exists(cob);
                if (!chk) { this.add(cob); }
            }
            if (chk) { 
                // throw "Namespace: " + name + " is already defined."; 
            }
        },

        add: function (cob) {
            eval("window." + cob + " = new Object();");
        },

        exists: function (cob) {
            eval('var NE = false; try{if(' + cob + '){NE = true;}else{NE = false;}}catch(err){NE=false;}');
            return NE;
        }
    };
    Array.prototype.contains = function (item) {
        /// <summary>Verifies if an object is contained by the array.</summary>
        /// <param name="item">Candidate item of the array</param>
        /// <returns>bool</returns>
        for (i = 0; i < this.length; i++) {
            if (this[i] == item) return true;
        }
        return false;
    };
    Array.prototype.add = function (item) {
        this.unshift(item);
        $.unique(this);
    };
    Array.prototype.remove = function (item) {
        var removed = false;
        var index = 0;
        while ((index < this.length) && !removed) {
            if (this[index] == item) {
                this.splice(index, 1);
                removed = true;
            }
            index++;
        }
    };
    String.prototype.format = function () {
        var args = arguments;

        if (typeof args[0] === 'object') {

            var obj = args[0];

            return this.replace(/{(\w+)}/g, function (match, name) {
                return typeof obj[name] != 'undefined'
                ? obj[name]
                : match;
            });


        } else {
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                ? args[number]
                : match;
            });
        }
    };

    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };


    Number.prototype.padLeft = function (digits) {
        var result = this.toFixed(0);
        var temp = digits - result.length;
        var zeros = "";
        while (temp > 0) {
            zeros += '0';
            temp--;
        }
        return zeros + result;
    };
    Number.prototype.toBrazilianCurrency = function () {
        var aux = this.toFixed(2);
        var decimalPart = parseInt(aux.split('.')[1]);
        var integralPart = parseInt(aux.split('.')[0]);
        var integralWithSeparators = addSeparators(integralPart, '.');
        return 'R$ ' + integralWithSeparators + ',' + decimalPart.padLeft(2);
    };

    function addSeparators(value, separator) {
        var rightmost = 0;
        var leftmost = value;
        var result = '';
        while (leftmost > 999) {
            rightmost = leftmost % 1000;
            leftmost = (leftmost - rightmost) / 1000;
            result = result + rightmost.padLeft(3);
            if (leftmost > 0) {
                result = separator + result;
            }
        }
        if (leftmost > 0) {
            result = leftmost.toFixed(0) + result;
        }
        return (result == '') ? '0' : result;
    }
// #endregion

// http://develop-lojasmel.vtexcommerce.com.br/Scripts/vtex.jsevents.js
// #region vtex.jsevents.js
    /// <reference path="vtex.common.js" />

    Namespace.create('Vtex');
    Namespace.create('Vtex.JSEvents');

    Vtex.JSEvents.EventArgs = Class.create();
    Vtex.JSEvents.EventArgs.prototype = {
        initialize: function () {
        }
    }

    Vtex.JSEvents.Listener = Class.create();
    Vtex.JSEvents.Listener.prototype = {
        initialize: function (name, callback) {
            this.name = name;
            this.callback = callback;
        },

        notify: function (e) {
            /// <summary>
            /// Notifies the firing of an event.
            /// </summary>
            /// <param name="e" type="Vtex.JSEvents.EventArgs">
            /// Event arguments. This object carries the event context.
            /// </param>
            this.callback(e);
        }
    }

    Vtex.JSEvents.Event = Class.create();
    Vtex.JSEvents.Event.prototype = {
        initialize: function (eventId) {
            this.id = eventId;
            this.listeners = new Array();
        },

        addListener: function (listener) {
            this.listeners.push(listener);
        },

        fire: function (e) {
            var listener;
            for (var i = 0; i < this.listeners.length; i++) {
                listener = this.listeners[i];
                listener.notify(e);
            }
        }
    }

    Vtex.JSEvents.EventDispatcher = Class.create();
    Vtex.JSEvents.EventDispatcher.prototype = {
        events: new Object(),

        initialize: function () {
        },

        registerEvent: function (event) {
            this.events[event.id] = event;
        },

        addListener: function (eventId, listener) {
            var event = this.events[eventId];
            if (event != null) {
                event.addListener(listener);
            }
        },

        fireEvent: function (eventId) {
            this.fireEvent(eventId, new Vtex.JSEvents.EventArgs());
        },

        fireEvent: function (eventId, e) {
            var event = this.events[eventId];
            if (event != null) {
                event.fire(e);
            }
        }
    }
// #endregion

// http://develop-lojasmel.vtexcommerce.com.br/Scripts/vtex.skuEvents.js
// #region vtex.skuEvents.js
    /// <reference path="jquery-1.4.1-vsdoc.js" />
    /// <reference path="vtex.common.js" />
    /// <reference path="vtex.jsevents.js" />
    Namespace.create('Vtex.Commerce.JSEvents');

    var skuSelectionChangedEventName = 'skuSelectionChanged';
    var skuDataReceivedEventName = 'skuDataReceived';
    var skuImageRelatedSpecSelectedEventName = 'skuImageRelatedSpecSelected';

    Vtex.Commerce.JSEvents.SkuData = Class.create();
    Vtex.Commerce.JSEvents.SkuData.prototype = {
        initialize: function () {
            this.id = 0;
            this.idProduct = 0;
            this.name = '';
            this.listPrice = 0.00;
            this.price = 0.00;
            this.availability = false;
            this.availabilitymessage = '';
            this.bestInstallmentValue = 0.00;
            this.bestInstallmentNumer = 0;
            this.images = new Array();
            this.reference = '';
            this.hasExtendedWarranty = false;
            this.hasExtendedWarrantyPage = false;
            this.notifyMe = false;
            this.HasServiceAtProductPage = false;
            this.HasServiceAtCartPage = false;
            this.HasServiceAtServicePage = false;
            this.RealHeight = 0.00;
            this.RealWidth = 0.00;
            this.RealLength = 0.00;
            this.RealWeightKg = 0.00;
            this.RewardValue = 0.00;
            this.Ean = '';        
        }
    }

    var ListSkuData = new Array();

    Vtex.Commerce.JSEvents.SkuSelectionChangedEventArgs = Class.create();
    Vtex.Commerce.JSEvents.SkuSelectionChangedEventArgs.prototype = new Vtex.JSEvents.EventArgs();
    Vtex.Commerce.JSEvents.SkuSelectionChangedEventArgs.prototype.newSkuId = 0;
    Vtex.Commerce.JSEvents.SkuSelectionChangedEventArgs.prototype.productIndex = 0;

    Vtex.Commerce.JSEvents.SkuDataReceivedEventArgs = Class.create();
    Vtex.Commerce.JSEvents.SkuDataReceivedEventArgs.prototype = new Vtex.JSEvents.EventArgs();
    Vtex.Commerce.JSEvents.SkuDataReceivedEventArgs.prototype.skuData = null;
    Vtex.Commerce.JSEvents.SkuDataReceivedEventArgs.prototype.productIndex = 0;

    var skuSelectionChanged = new Vtex.JSEvents.Event(skuSelectionChangedEventName);
    var skuDataReceived = new Vtex.JSEvents.Event(skuDataReceivedEventName);
    var skuImageRelatedSpecSelected = new Vtex.JSEvents.Event(skuImageRelatedSpecSelectedEventName);

    var skuEventDispatcher = new Vtex.JSEvents.EventDispatcher();
    skuEventDispatcher.registerEvent(skuSelectionChanged);
    skuEventDispatcher.registerEvent(skuDataReceived);
    skuEventDispatcher.registerEvent(skuImageRelatedSpecSelected);


    function FireSkuSelectionChanged(skuId, pi) {
        var args = new Vtex.Commerce.JSEvents.SkuSelectionChangedEventArgs();
        args.newSkuId = skuId;
        args.productIndex = pi;
        skuEventDispatcher.fireEvent(skuSelectionChangedEventName, args);
        
    }

    function FireSkuDataReceived(sku, pi) {
        var args = new Vtex.Commerce.JSEvents.SkuDataReceivedEventArgs();
        args.skuData = sku;
        args.productIndex = pi;
        skuEventDispatcher.fireEvent(skuDataReceivedEventName, args);
       
    }

    function FireSkuChangeImage(sku) {
        var args = new Vtex.Commerce.JSEvents.SkuSelectionChangedEventArgs();
        args.newSkuId = sku;
        skuEventDispatcher.fireEvent(skuImageRelatedSpecSelectedEventName, args);
    }

    function force() { 

    }

    //force
// #endregion

// http://develop-lojasmel.vtexcommerce.com.br/Scripts/vtex.skuEvents.skuDataFetcher.js
// #region vtex.skuEvents.skuDataFetcher.js
    /// <reference path="jquery-1.4.1-vsdoc.js" />
    /// <reference path="vtex.common.js" />
    /// <reference path="vtex.jsevents.js" />
    /// <reference path="vtex.skuEvents.js" />

    var skuDataFetcherListener = new Vtex.JSEvents.Listener('skuDataFetcher', SkuDataFetcher_OnSkuSelectionChanged);
    skuEventDispatcher.addListener(skuSelectionChangedEventName, skuDataFetcherListener);

    function SkuDataFetcher_OnSkuSelectionChanged(e) {
        var skuId = e.newSkuId;
        var skuData = getSkuData(skuId);
        FireSkuDataReceived(skuData, e.productIndex);
    }


    function getSkuData(skuId) {
        var skuData = new Vtex.Commerce.JSEvents.SkuData();
        // chamadaAjax para pegar os dados do Sku;
        // popula skuData
        if (skuId > 0) {
            if (ListSkuData["sku" + skuId] === undefined) {
                $.ajax({
                    type: "GET",
                    url: '/produto/sku/' + skuId,
                    dataType: 'json',
                    async: false,
                    success: function (dataValue) {
                        var temp = "";
                        for (var i in dataValue) {
                            if (!isNaN(i)) {
                                skuData.id = dataValue[i].Id;
                                skuData.idProduct = dataValue[i].IdProduct;
                                skuData.name = dataValue[i].Name;
                                skuData.listPrice = dataValue[i].ListPrice;
                                skuData.price = dataValue[i].Price;
                                skuData.availability = dataValue[i].Availability;
                                skuData.availabilitymessage = dataValue[i].AvailabilityMessage;
                                skuData.bestInstallmentValue = dataValue[i].BestInstallmentValue;
                                skuData.bestInstallmentNumber = dataValue[i].BestInstallmentNumber;
                                skuData.images = dataValue[i].Images;
                                skuData.reference = dataValue[i].Reference;
                                skuData.hasExtendedWarranty = dataValue[i].HasExtendedWarranty;
                                skuData.hasExtendedWarrantyPage = dataValue[i].HasExtendedWarrantyPage;

                                skuData.notifyMe = dataValue[i].NotifyMe;
                                skuData.HasServiceAtServicePage = dataValue[i].HasServiceAtServicePage;

                                skuData.HasServiceAtCartPage = dataValue[i].HasServiceAtCartPage;
                                skuData.HasServiceAtProductPage = dataValue[i].HasServiceAtProductPage;

                                skuData.RealHeight = dataValue[i].RealHeight;
                                skuData.RealWidth = dataValue[i].RealWidth;
                                skuData.RealLength = dataValue[i].RealLength;
                                skuData.RealWeightKg = dataValue[i].RealWeightKg;
                                skuData.RewardValue = dataValue[i].RewardValue;
                                skuData.Ean = dataValue[i].Ean;

                                ListSkuData["sku" + dataValue[i].Id] = skuData;

                            }
                        }
                        //alert(ListSkuData["sku" + skuId]);
                    },
                    error: function () {
                        alert("erro ao buscar objeto SKU");
                    }
                });
            }
            skuData = ListSkuData["sku" + skuId];
            /*alert(skuData);
            alert(skuData.images.length);
            alert(skuData.images);
            alert(skuData.images[0][0].IdArchive);*/
        }
        else {
            alert("SKU nao encontrado");
        }
        return skuData;
    }
// #endregion

// http://develop-lojasmel.vtexcommerce.com.br/Scripts/vtex.viewPart.skuSpecification.js
// #region vtex.viewPart.skuSpecification.js
    /// <reference path="jquery-1.4.1-vsdoc.js" />
    /// <reference path="vtex.common.js" />
    /// <reference path="vtex.jsevents.js" />
    /// <reference path="vtex.skuEvents.js" />

    function getValuesOptions(espec) {
        espec = "*[name='" + espec + "']";
        var strValues = ""
        if ($(espec).is("input:radio")) {
            $(espec).each(function() {
                strValues += "," + $(this).val();
            });
        }
        else {
            $(espec).find('option').each(function() {
                if ($(this).val() && $(this).val() != "") {
                    strValues += "," + $(this).val();
                }
            });
        }
        return strValues.substring(1);
    }
    function enableOptions(selecionaveis) {
        $.each(selecionaveis, function(i, data) {
            $.each(data, function(j, data1) {
                var temp = "[name='espec_" + i + "']";
                if ($(temp).is("input:radio")) {
                    temp = "input" + temp + "[value='" + data1 + "']";
                }
                else {
                    temp = "select" + temp + " option[value=" + data1 + "]";
                }
                $(temp).removeAttr("disabled");
            });
        });
    }
    function enableAllOptions() {
        for (j = 0; j < myJSONSkuSpecification.specifications; j++) {
            var temp = "*[name='espec_" + j + "']";
            if ($(temp).is("input:radio")) {
                $(temp).each(function() {
                    $(this).removeAttr("disabled");
                });
            }
            else {
                $(temp).find('option').each(function() {
                    $(this).removeAttr("disabled");
                });
            }
        }
    }
    function checkSelected() {
        for (j = 0; j < myJSONSkuSpecification.specifications; j++) {
            //verifico se após as mudanças
            //ficou um selecionado desabilitado
            var temp = "*[name='espec_" + j + "']";
            if ($(temp).is("input:radio")) {
                $(temp).each(function () {
                    if ($(this).is(":checked") && $(this).is(":disabled")) {
                        $(this).removeAttr("checked");
                    }
                    else if ($(this).is(":checked")) {
                        $("label[for='" + $(this).attr("id") + "']").addClass("sku-picked");
                    }
                });
            }
            else {
                $(temp).find('option').each(function() {
                    if ($(this).is(":selected") && $(this).is(":disabled")) {
                        $(this).removeAttr("selected");
                        //para bug do IE:
                        $(temp).find('option:first').each(function() {
                            $(this).attr("selected", "selected");
                        });
                    }
                });
            }
        }
    }
    function getSelected() {
        var strJson = "";
        var selectors = 0; //total de especificação selecionada
        var i = 0; //variavel para usar no array indicando a especificacao
        var valuesSelect = Array(); //valores da especificacao selecionada
        var m = 0;
        if ($('.sku-selector').length > 0) {
            while (true) {
                var nome = "#espec_" + i + "_opcao_0";
                if ($(nome).length > 0) {
                    var j = 0;
                    while (true) {
                        var nome2 = "#espec_" + i + "_opcao_" + j;
                        var valor = "";
                        if ($(nome2).length > 0) {
                            if ($(nome2).is("input:radio")) {
                                if ($(nome2).is(":checked")) {
                                    valor = $(nome2).val();
                                    selectors++;
                                }
                            }
                            else {
                                if ($(nome2).val() && $(nome2).val() != "") {
                                    valor = $(nome2).val();
                                    selectors++;
                                }
                            }
                            if (valor != "") {
                                strJson += ",{'value':'" + valor + "',";
                                strJson += "'name':'espec_" + i + "'}";
                                valuesSelect[m] = valor;
                                m++;
                            }
                        }
                        else {
                            break;
                        }
                        j++
                    }
                }
                else {
                    break;
                }
                i++;
            }
        }
        if (strJson == "")
            strJson = "[{}]";
        else
            strJson = "[" + strJson.substring(1) + "]";

        return eval('(' + strJson + ')'); ;
    }

    function getSku() {
        var selectedValue = getSelected();
        if (selectedValue.length == myJSONSkuSpecification.specifications) { //todos os itens selecionados
            var selection = "";
            $.each(selectedValue, function(i, data) {
                selection += "," + data.value;
            });
            selection = selection.substring(1);
            var idSku = null;
            $.each(myJSONSkuSpecification.skus, function(i, data) {
                if (data[selection]) {
                    idSku = data[selection];
                    return false;
                }
            });
            FireSkuSelectionChanged(idSku);
            //alert(idSku);
        }
    }
// #endregion

// http://develop-lojasmel.vtexcommerce.com.br/Scripts/vtex.viewPart.skuPrice.js
// #region vtex.viewPart.skuPrice.js
    /// <reference path="jquery-1.4.1-vsdoc.js" />
    /// <reference path="vtex.common.js" />
    /// <reference path="vtex.jsevents.js" />
    /// <reference path="vtex.skuEvents.js" />

    $(document).ready(function() {
        var skuPriceListener = new Vtex.JSEvents.Listener('skuPriceListener', SkuPrice_OnSkuDataReceived);
        skuEventDispatcher.addListener(skuDataReceivedEventName, skuPriceListener);
    });

    function SkuPrice_OnSkuDataReceived(e) {
        if (e.skuData.id > 0) {
            var pi = e.productIndex;
            if (pi == undefined) { pi = 0; }
            if (e.skuData.availability == false) {
                $('.valor-de[productIndex='+pi+']').attr('style', 'display:none');
                $('.valor-por[productIndex=' + pi + ']').attr('style', 'display:none');
                $('.valor-dividido[productIndex=' + pi + ']').attr('style', 'display:none');
                $('.preco-a-vista[productIndex=' + pi + ']').attr('style', 'display:none');
                $('.economia-de[productIndex=' + pi + ']').attr('style', 'display:none'); 
            }
            else {
                $('.valor-por[productIndex=' + pi + ']').attr('style', 'display:block');
                if (e.skuData.price < e.skuData.listPrice) {
                    $('.valor-de[productIndex=' + pi + ']').attr('style', 'display:block');
                    $('.skuListPrice[productIndex=' + pi + ']').html('R$ ' + FormatNumber(e.skuData.listPrice));
                }
                else {
                    $('.valor-de[productIndex=' + pi + ']').attr('style', 'display:none');
                }


                $('.skuBestPrice[productIndex=' + pi + ']').html('R$ ' + FormatNumber(e.skuData.price));

                if (e.skuData.bestInstallmentNumber > 1) {
                    $('.valor-dividido[productIndex=' + pi + ']').attr('style', 'display:block');
                    $('.preco-a-vista[productIndex=' + pi + ']').attr('style', 'display:none');
                }
                else {
                    $('.valor-dividido[productIndex=' + pi + ']').attr('style', 'display:none');
                    $('.preco-a-vista[productIndex=' + pi + ']').attr('style', 'display:block');
                }
                $('.skuBestInstallmentNumber[productIndex=' + pi + ']').html(e.skuData.bestInstallmentNumber);
                $('.skuBestInstallmentValue[productIndex=' + pi + ']').html('R$ ' + FormatNumber(e.skuData.bestInstallmentValue));
            }
        }
    }
// #endregion

// http://develop-lojasmel.vtexcommerce.com.br/Scripts/jquery.currency.min.js
// #region jquery.currency.min.js
    /* Copyright (c) 2009 Michael Manning (actingthemaggot.com) Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.*/
    (function(A) { A.fn.extend({ currency: function(B) { var C = { s: ",", d: ".", c: 2 }; C = A.extend({}, C, B); return this.each(function() { var D = (C.n || A(this).text()); D = (typeof D === "number") ? D : ((/\./.test(D)) ? parseFloat(D) : parseInt(D)), s = D < 0 ? "-" : "", i = parseInt(D = Math.abs(+D || 0).toFixed(C.c)) + "", j = (j = i.length) > 3 ? j % 3 : 0; A(this).text(s + (j ? i.substr(0, j) + C.s : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + C.s) + (C.c ? C.d + Math.abs(D - i).toFixed(C.c).slice(2) : "")); return this }) } }) })(jQuery); jQuery.currency = function() { var A = jQuery("<span>").text(arguments[0]).currency(arguments[1]); return A.text() };


    function FormatNumber(number) {
        return $.currency(number, { s: ".", d: ",", c: 2 });
    }
// #endregion

// http://develop-lojasmel.vtexcommerce.com.br/Scripts/vtex.viewPart.buyButton.js
// #region vtex.viewPart.buyButton.js
    /// <reference path="jquery-1.4.1-vsdoc.js" />
    /// <reference path="vtex.common.js" />
    /// <reference path="vtex.jsevents.js" />
    /// <reference path="vtex.skuEvents.js" />

    var notifymeTitle = "";
    var notifymeUrl = "";
    var notifymeError = "";
    var notifymeSuccess = "";
    var notifymeLoading = "";
    var notifymeskuData = new Vtex.Commerce.JSEvents.SkuData();

    $(document).ready(function () {
        var buyButtonListener = new Vtex.JSEvents.Listener('buyButtonListener', BuyButton_OnSkuDataReceived);
        skuEventDispatcher.addListener(skuDataReceivedEventName, buyButtonListener);
    });

    function BuyButton_OnSkuDataReceived(e) {
        if (e.skuData.id > 0) {
            notifymeskuData = e;

            var amount = $('.buy-button-amount').attr('value');
            if (e.skuData.availability == true) {
                if (e.skuData.HasServiceAtServicePage == true) {
                    if (amount != null && amount != '0') {
                        $('.buy-button').attr('href', '/Site/Servicos.aspx?IdProduto=' + e.skuData.idProduct + '&IdSku=' + e.skuData.id + '&quantidade=' + amount);
                    }
                    else {
                        $('.buy-button').attr('href', '/Site/Servicos.aspx?IdProduto=' + e.skuData.idProduct + '&IdSku=' + e.skuData.id);
                    }
                }
                else {
                    if (amount != null && amount != '0') {
                        $('.buy-button').attr('href', '/Site/Carrinho.aspx?IdSku=' + e.skuData.id + '&quantidade=' + amount);
                    }
                    else {
                        $('.buy-button').attr('href', '/Site/Carrinho.aspx?IdSku=' + e.skuData.id);
                    }
                }
                $('.unavailable-button').attr('style', 'display:none');
                $('.notifyme').hide();
                notifymeToggleForm($('.notifyme'), false);
                $('.buy-button').attr('style', 'display:block');
            }
            else {
                $('.buy-button').attr('style', 'display:none');
                if (e.skuData.notifyMe) {
                    $('.unavailable-button').attr('style', 'display:none');
                    $('.notifyme').show();
                    notifymeToggleForm($('.notifyme'), true);
                }
                else {
                    $('.unavailable-button').attr('style', 'display:block');
                    $('.notifyme').hide();
                    notifymeToggleForm($('.notifyme'), false);
                }
            }
        }
    }

    $(document).ready(function () {
        if ($('.notifyme').length > 0) {
            notifymeOnButtomOkClick();
        }
    });

    function notifymeOnButtomOkClick() {

        if($('.notifyme-button-ok').length<=0) return false;
        if($('.notifyme-button-ok.active').length>0) return false;

        $('.notifyme-button-ok').not(".active").addClass("active").click(function () {
            var notifymeskuid = '';
            if (notifymeskuData.skuData === undefined || notifymeskuData.skuData.id === undefined) {
                //alert("Original");
                notifymeskuid = $('.notifyme-skuid').val();
            }
            else {
                //alert("Dinamico");
                notifymeskuid = notifymeskuData.skuData.id;
            }
            var clientName = $('.notifyme-client-name').val();
            var clientEmail = $('.notifyme-client-email').val();
            clientName = clientName.replace("Digite seu nome...", "");
            clientEmail = clientEmail.replace("Digite seu e-mail...", "");
            if (clientName.length > 0 && notifymeCheckEmail(clientEmail)) {
                notifymeTitle = $('.notifyme-title').val();
                notifymeSuccess = $('.notifyme-success').val();
                notifymeError = $('.notifyme-error').val();
                notifymeLoading = '<p class=\'notifyme-loading-message\'>' + $('.notifyme-loading').val() + '</p>';
                var dataToPost = { notifymeClientName: clientName, notifymeClientEmail: clientEmail, notifymeIdSku: notifymeskuid };
                var url = '/no-cache/AviseMe.aspx';
                ajaxRequest('POST', url, dataToPost, '.notifyme', '');
            }
        });
    }


    function notifymeSelect(sender, defaultValue) {
        if (sender.value == defaultValue) sender.value = '';
        else sender.select();
    }

    function notifymeLeave(sender, defaultValue) {
        if (jQuery.trim(sender.value) == '') sender.value = defaultValue;
    }

    function ajaxRequest(method, url, postData, target, callback) {
        $(target).append(notifymeLoading);
        $.ajax({
            type: method,
            url: url,
            data: postData,
            success: function (dataResult) {
                if (target != null && target != '') {

                    var $target = $(target);
                    notifymeToggleForm($target, false);


                    if (dataResult == 'true') {
                        $target.append(notifymeMakeSuccessMessage());
                    } else {
                        $target.append(notifymeMakeErrorMessage());
                    };
                }
                if (callback != null && callback != '') callback();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                notifymeToggleForm($(target), false);
                $(target).append(notifymeMakeErrorMessage());
            }
        });
    }

    function notifymeToggleForm($target, blExibeForm) {

        if (blExibeForm) {
            $target.find('.notifyme-form').show();
        } else {
            $target.find('.notifyme-form').hide();
        }

        $target.find('input.notifyme-client-name').val('Digite seu nome...');
        $target.find('input.notifyme-client-email').val('Digite seu e-mail...');

        $target.find('fieldset.error, fieldset.success, p.notifyme-loading-message').remove();


    }

    function notifymeMakeSuccessMessage() {
        return '<fieldset class="success"><label><em>' + notifymeSuccess + '</em></label></fieldset>';
    }

    function notifymeMakeTitle() {
        return '<h3>' + notifymeTitle + '</h3>';
    }

    function notifymeMakeErrorMessage() {
        return '<fieldset class="error"><label>' + notifymeError + '</label></fieldset>';
    }

    function notifymeCheckEmail(email) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return (true);
        }
        notifymeError = "Email inválido, digite novamente";
        if ($('.notifyme').html().indexOf(notifymeMakeErrorMessage()) == -1) {
            $('.notifyme').append(notifymeMakeErrorMessage());
        }
        return (false);
    }
// #endregion

// /Scripts/vtex.viewPart.ImageControl.js
// #region image control

function imageControl_OnSkuImageRelatedSpecSelected(e) {
    var skuData = getSkuData(e.newSkuId);
    var args = new Vtex.Commerce.JSEvents.SkuDataReceivedEventArgs();
    args.skuData = skuData;
    imageControl_OnSkuDataReceived(args);
}

function imageControl_OnSkuDataReceived(e) {
    //Limpo as imagens thumb
    $("ul.thumbs").html("");

    var arrayLi = new Array();
    var idMain = 0;
    var idZoom = 0;
    var idThumb = 0;
    var pathMain = "";
    var pathZoom = "";
    var pathThumb = "";

    var pi = e.productIndex;
    if(pi === undefined){pi = 0;}
    //Inicio o loop para preencher o objeto li com as novas tumbs
    for (i = 0; i < e.skuData.images.length; i++) {
        idZoom = 0;
        idThumb = 0;
        for (j = 0; j < e.skuData.images[i].length; j++) {
            if (e.skuData.images[i][j].ArchiveTypeId == 3) {
                idThumb = e.skuData.images[i][j].IdArchive;
                pathThumb = e.skuData.images[i][j].Path;
            }
            if (e.skuData.images[i][j].ArchiveTypeId == 2) {
                idMain = e.skuData.images[i][j].IdArchive;
                pathMain = e.skuData.images[i][j].Path;
            }
            if (e.skuData.images[i][j].ArchiveTypeId == 10) {
                idZoom = e.skuData.images[i][j].IdArchive;
                pathZoom = e.skuData.images[i][j].Path;
            }

        }
        if (idMain > 0 && idThumb > 0) {
            arrayLi[i] = $("<li></li>");
            var href = $("<a></a>").attr('rel', pathMain).attr('title', 'Zoom').attr('href', 'javascript:void(0);').attr("id", "botaoZoom").attr("class", "");
            if (idZoom > 0) {
                href.attr('zoom', pathZoom)
            }
            else {
                href.attr('zoom', '')
            }
            var img = $('<img />').attr('title', e.skuData.name).attr('src', pathThumb); ;
            href.append(img);
            arrayLi[i].append(href);
        }
    }
    //fim do loop

    // preencho a ul com os li criados
    for (i = 0; i < arrayLi.length; i++) {
        $("ul.thumbs").append(arrayLi[i]);
    }

    //recalculo a imagem zoom e os clicks
    ImageControl($("ul.thumbs a:first"), pi);
    clickThumbs();
}

function clickThumbs() {
    $("ul.thumbs a").click(function () {
        ImageControl(this,0); 
    });
}

function ImageControl(a, pi) {
    $("ul.thumbs a").removeClass("ON");
    var ID = $(a).attr("id");
    var pos = $(a).offset();
    var holder = $("#produto").offset();
    var alt = $("[id=show] [id=include] [id=image][productIndex=" + pi + "] img").attr("alt"); //alt/title da imagem principal
    var image = $('<img />')

    $(a).addClass("ON");
    $("div#setaThumbs").css({ 'left': (pos.left - holder.left + 30) + 'px' });
    if ($("[id=show] [id=include] [id=image][productIndex=" + pi + "] a").length > 0) {
        $("[id=show] [id=include] [id=image][productIndex=" + pi + "] a").remove();
    }
    else {
        $("[id=show] [id=include] [id=image][productIndex=" + pi + "] img").remove();
    }

    //Preencho as opcoes da imagem principal
    if (pi == 0) {
        image.attr("id", "image-main").attr("src", $(a).attr("rel")).attr('productIndex', pi).attr('class','sku-rich-image-main');
    } else {
        image.attr("id", "image-main").attr("src", $(a).attr("rel")).attr('productIndex', pi);
    }



    // VERIFICO SE TEM ZOOM.
    if ($(a).attr("zoom") == "") {
        image.attr("alt", alt).attr("title", alt)
        $("[id=show] [id=include] [id=image][productIndex=" + pi + "]").append(image);
    }
    else {
        var href = $("<a></a>").addClass("image-zoom").attr("href", $(a).attr("zoom"));
        href.append(image);
        $("[id=show] [id=include] [id=image][productIndex=" + pi + "]").append(href);
        LoadZoom(pi);
    }

}

//ZOOM
function LoadZoom(pi) {
    if ($(".image-zoom").length > 0) {
        var width = 300;
        var height = 300;

        var node = $("<div></div>");

        node.addClass('jqZoomWindow');
        $("[id=show] [id=include] [id=image][productIndex=" + pi + "]").append(node);
        if (node.css("width") != "auto" && node.css("width") != null) {
            width = parseInt(node.css("width").replace("px", ""));

        }
        if (node.css("height") != "auto" && node.css("height") != null) {
            height = parseInt(node.css("height").replace("px", ""));
        }
        node.remove();
        var optionsZoom = {
            //zoomType: "reverse",
            preloadText: "",
            zoomWidth: width,
            zoomHeight: height
        };
        if(typeof jQuery.fn.jqzoom !="undefined")
            $(".image-zoom").jqzoom(optionsZoom);
    }
}

// #endregion