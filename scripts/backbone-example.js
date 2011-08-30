(function($) {

  window.Detail = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this, 'calculateAmount', 'keyup');
    },

    keyup: function(data) {
      if (data['price'] != null && data['price'] != this.get('price')) {
        this.set({price: data['price']}, {silent: true});
        this.calculateAmount();
      } else if (data['quantity'] != null && data['quantity'] != this.get('quantity')) {
        this.set({quantity: data['quantity']}, {silent: true});
        this.calculateAmount();
      } else if (data['amount'] != null && data['amount'] != this.get('amount')) {
        this.set({amount: data['amount']}, {silent: true});
        this.set({price: ''});
      }
    },

    calculateAmount: function() {
      this.set({amount: (this.get('quantity') * this.get('price'))});
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

    events: {
      'keyup input': 'keyupInput'
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },

    changeQuantity: function() {
      $(this.el).find('input.quantity').val(this.model.get('quantity'));
    },
    changePrice: function() {
      $(this.el).find('input.price').val(this.model.get('price'));
    },
    changeAmount: function() {
      $(this.el).find('input.amount').val(this.model.get('amount'));
    },

    keyupInput: function(e) {
      var property = $(e.currentTarget).attr('class');
      var value = $(e.currentTarget).val();
      var data = {};
      data[property] = value;
      this.model.keyup(data);
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
  sample = new Details([{quantity:2,price:3,amount:1},{quantity:4,price:6,amount:24}]);
  view = new DetailsView({collection:sample});
  $('body').html(view.render().el);
});
