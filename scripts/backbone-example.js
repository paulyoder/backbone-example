(function($) {

  window.Detail = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this, 'calculateAmount', 'onAmountChanged');
      this.bind('change:price', this.calculateAmount);
      this.bind('change:quantity', this.calculateAmount);
      //this.bind('change:amount', this.onAmountChanged);
    },

    keypress: function(data) {
      alert('start here');
    },

    onAmountChanged: function() {
      console.log('onAmountChanged');
      this.set({price: 0, quantity: 0});
    },

    calculateAmount: function() {
      var price = this.get('price');
      var quantity = this.get('quantity');
      this.set({amount: (price * quantity)});
    }
  });

  window.DetailView = Backbone.View.extend({
    tagName: 'tr',

    initialize: function() {
      _.bindAll(this, 'render', 'updateQuantity', 'updatePrice', 'updateAmount', 'inputChanged');
      this.model.bind('change:quantity', this.updateQuantity);
      this.model.bind('change:price', this.updatePrice);
      this.model.bind('change:amount', this.updateAmount);
      this.template = _.template($('#row-template').html());
    },

    events: {
      'keyup input': 'inputChanged'
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },

    updateQuantity: function() {
      $(this.el).find('input.quantity').val(this.model.get('quantity'));
    },
    updatePrice: function() {
      $(this.el).find('input.price').val(this.model.get('price'));
    },
    updateAmount: function() {
      $(this.el).find('input.amount').val(this.model.get('amount'));
    },

    inputChanged: function(e) {
      console.log('inputChanged()');
      var property = $(e.currentTarget).attr('class');
      var value = $(e.currentTarget).val();
      var data = {};
      data[property] = value;
      this.model.keypress(data);
    }
  });
 
  window.Details = Backbone.Collection.extend({
    model: Detail  
  });

  window.DetailsView = Backbone.View.extend({
    tagName: 'table',

    initialze: function() {
      _.bindAll(this, 'render');
    },
    
    render: function() {
      $table = $(this.el);
      $table.html($('#details-template').html());
      this.collection.each(function(detail) {
        var detailView = new DetailView({model: detail});
        $table.append(detailView.render().el);
      }); 
      return this;
    }
  });

})(jQuery);

$(function() {
  sample = new Details([{quantity:2,price:3,amount:6},{quantity:4,price:6,amount:24}]);
  view = new DetailsView({collection:sample});
  $('body').html(view.render().el);
});
