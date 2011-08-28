(function($) {


  window.Detail = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this, 'calculateAmount');
      this.bind('change', this.calculateAmount);
    },

    calculateAmount: function() {
      var price = this.get('price');
      var quantity = this.get('quantity');
      var amount = price * quantity;
      this.set({amount: amount});
    }
  });

  window.DetailView = Backbone.View.extend({
    tagName: 'tr',

    initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
      this.template = _.template($('#row-template').html());
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
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
      this.model.each(function(detail) {
        var detailView = new DetailView({model: detail});
        $table.append(detailView.render().el);
      }); 
      return this;
    }
  });

})(jQuery);

$(function() {
  sample = new Details([{quantity:2,price:3,amount:6},{quantity:4,price:6,amount:24}]);
  view = new DetailsView({model:sample});
  $('body').html(view.render().el);
});
