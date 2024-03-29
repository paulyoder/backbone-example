(function($) {

  formatNumber = function(number, maxLength, decimalPlaces, allowNegative) {
    if (typeof(number) == 'number') {
      number = number.toString();
    }
    //scrub number
    number = number.replace(/[^-\.0-9]/g,'')            //only keep numbers, negative and decimal
                   .replace(/--+/g,'-')                 //delete multiple negatives
                   .replace(/^(-?\d*\.\d*)\..*$/g,'$1') //only allow one decimal
                   .replace(/(\d)-/g,'$1')              //delete negatives in middle of number
                   .replace(/^(-?)0+(\w)/g,'$1$2');     //delete leading zeros but allow single 0

    if (maxLength > 0) { 
      //make sure there are not more numbers than the maxLength
      var regEx = new RegExp("^(-?\\d{" + maxLength + "})\\d*(\\.\\d*)?$", 'g');
      number = number.replace(regEx,'$1$2'); 
    }

    if (!allowNegative) { number = number.replace(/-/g,''); }

    if (decimalPlaces == 0) { number = number.replace(/\.\d+$/g,''); }
    else { 
      var regEx = new RegExp("(\\.\\d{" + decimalPlaces + "})\\d+$", 'g');
      number = number.replace(regEx,'$1');
    }

    //add commas before returning
    return number.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); 
  };

  option = function(text, value) {
    return '<option value="' + value + '">' + text + '</option>';
  };

  window.Detail = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this, 'calculateAmount', 'keyup', 'getNumber');
    },

    format: {
      price:    function(value) { return formatNumber(value, 9, 2, true); },
      quantity: function(value) { return formatNumber(value, 9, 2, true); },
      amount:   function(value) { return formatNumber(value, 9, 0, true); }
    },
    
    getNumber: function(property) {
      return Number(this.get(property).toString().replace(/,/g,''));
    },

    processKeyup: {
      price: function(model, value) {
        if (value == model.get('price')) { return; }
        model.set({price: value}, {silent: true});
        model.set({price: model.format.price(value)});
        model.calculateAmount(); 
      },
      quantity: function(model, value) {
        if (value == model.get('quantity')) { return; }
        model.set({quantity: value}, {silent: true});
        model.set({quantity: model.format.quantity(value)});
        model.calculateAmount();
      },
      amount: function(model, value) {
        if (value == model.get('amount')) { return; }
        model.set({price: ''});
        //model.set({amount: value}, {silent: true});
        model.set({amount: model.format.amount(value)});
      }
    },

    keyup: function(data) {
      var property = _.keys(data)[0];
      var value = _.values(data)[0];
      this.processKeyup[property](this, value);
    },

    calculateAmount: function() {
      console.log('calculateAmount');
      var product = this.getNumber('quantity') * this.getNumber('price');
      this.set({amount: this.format.amount(product)});
    }
  });

  window.DetailView = Backbone.View.extend({
    tagName: 'tr',

    initialize: function() {
      _.bindAll(this, 'render', 'changeQuantity', 'changePrice', 'changeAmount', 'keyupInput');
      this.model.bind('change:quantity', this.changeQuantity);
      this.model.bind('change:price', this.changePrice);
      this.model.bind('change:amount', this.changeAmount);
      this.template = _.template($('#row-template').html());
    },

    detailTypes: {
      1: 'Indiana',
      2: 'Nebraska',
      3: 'Colorado'
    },

    events: {
      'keyup input': 'keyupInput',
      'change select': 'changeSelect'
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      var select = $(this.el).find('select');
      _.each(this.detailTypes, function(text, value) {
        select.append(option(text, value));
      });
      select.find('option[value=' + this.model.get('detailTypeId') + ']').attr('selected', 'selected');
      return this;
    },

    changeQuantity: function() {
      console.log('changeQuantity');
      $(this.el).find('input[property=quantity]').val(this.model.get('quantity'));
    },
    changePrice: function() {
      console.log('changePrice');
      $(this.el).find('input[property=price]').val(this.model.get('price'));
    },
    changeAmount: function() {
      console.log('changeAmount');
      var input = $(this.el).find('input[property=amount]');
      if (input.val() != this.model.get('amount')) {
        input.val(this.model.get('amount'));
      }
    },

    keyupInput: function(e) {
      var property = $(e.currentTarget).attr('property');
      var value = $(e.currentTarget).val();
      var data = {};
      data[property] = value;
      this.model.keyup(data);
    },

    changeSelect: function(e) {
      console.log('changeSelect');
      var value = $(this.el).find('select option:selected').val();
      this.model.set({detailTypeId: value});
    }
  });
 
  window.Details = Backbone.Collection.extend({
    model: Detail  
  });

  window.DetailsView = Backbone.View.extend({
    el: '#container',

    initialize: function() {
      _.bindAll(this, 'render', 'detailAdded', 'click_AddRow', 'calculateCollectionTotals');
      this.collection.bind('add', this.detailAdded);
      this.collection.bind('add', this.calculateCollectionTotals);
      this.collection.bind('change:amount', this.calculateCollectionTotals);
    },

    events: { 'click #addRow': 'click_AddRow' },
    
    render: function() {
      $(this.el).empty();
      $(this.el).html($('#details-template').html());
      this.totalsRow = $(this.el).find('table:first tr:last');
      var totalsRow = this.totalsRow;
      this.collection.each(function(detail) {
        var detailView = new DetailView({model: detail});
        totalsRow.before(detailView.render().el);
      }); 
      this.calculateCollectionTotals();
      return this;
    },

    detailAdded: function(detail) {
      this.totalsRow.before(new DetailView({model: detail}).render().el);
    },

    click_AddRow: function() {
      this.collection.add(new Detail({detailTypeId:2,quantity:5,price:4,amount:20}));
    },

    calculateCollectionTotals: function() {
      console.log('calculateCollectionTotals');
      var amounts = _.map(this.collection.models, function(detail) {
        return detail.getNumber('amount');
      });
      var total = _.reduce(amounts, function(sum, amount) { return sum + amount; }, 0);
      var formattedTotal = formatNumber(total, 0, 0, true);
      this.totalsRow.find('td:last').html(formattedTotal);
    }
  });

})(jQuery);

$(function() {
  sample = new Details([{detailTypeId:1,quantity:2,price:3,amount:1},{detailTypeId:3,quantity:4,price:6,amount:24}]);
  view = new DetailsView({collection:sample, el:'#container'});
  view.render();
});
