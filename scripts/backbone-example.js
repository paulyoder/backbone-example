(function($) {

  window.Detail = Backbone.Model.extend({});

  window.DetailView = Backbone.View.extend({
    tagName: 'tr',

    initialize: function() {
      this.template = _.template($('#row-template').html());
    },

    render: function() {
      var renderedContent = this.template(this.model.toJSON());
      $(this.el).html(renderedContent);
      return this;
    }
  });

})(jQuery);
