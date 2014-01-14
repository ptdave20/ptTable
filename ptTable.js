$(function() {
	$.widget("widget.ptTable", {
		options: {
			select: {

			},
			columnNames: [],
			submitCallback: null,
			deleteCallback: null,
			editCallback: null
		},
		_create: function() {
			$(this.element).addClass('table');
			$(this.element).addClass('ui-widget');
			this.refresh();
		},
		_destroy: function() {
			$(this.element).find('ol').removeClass('tableHeader');
			$(this.element).find('ol').children().removeClass('ui-corner-tl ui-corner-tr ui-widget-header tableCell');
			$(this.element).find('ul').removeClass('tableRow');
			$(this.element).find('ul').remove();
			
			$(this.element).removeClass('table');
		},
		refresh: function() {
			var self = this;
			$(this.element).find('ol').each(function() {
				if($(this).attr('pt')=="header") {
					$(this).addClass('tableHeader');
					$(this).children().first().addClass('ui-corner-tl');
					$(this).children().last().addClass('ui-corner-tr');
					$(this).children().removeClass('ui-corner-tl ui-corner-tr');
					$(this).children().each(function(i) {
						if(i < self.options.columnNames.length && self.options.select[self.options.columnNames[i]]!=undefined) {
							if($(this).attr('name') != null)
								return;
							var name = self.options.columnNames[i];
							var optionsDiv = $('<div></div>').addClass('tablePopOver ui-widget ui-widget-content ui-corner-all');
							var select = $('<select multiple></select>').on('change', function(e) {
								$(self.element).find("[name='"+name+"'][value]").parent().hide();
								$.each($(this).val(), function(vI, val) {
									$(self.element).find("[name='"+name+"'][value='"+val+"']").parent().show();
								});
							});
							$.each(self.options.select[name], function(iO, opt) {
								var option = $('<option></option>').val(opt.value).text(opt.label).attr('selected', "1");
								option.appendTo(select);
							});
							optionsDiv.append(select).appendTo($(this));
							optionsDiv.hide();
							$(this).attr('name', name);
							var btn = $('<button></button>').button({
								icons: {
									primary: "ui-icon-triangle-1-s"
								}
							})
							.css("width","20px")
							.click(function() {
								optionsDiv.toggle();
							}).appendTo($(this));
							
						}
					});
				}
				if($(this).attr('pt')=="footer") {
					$(this).addClass('tableFooter');
					
					if($(this).find('[pt="submit"]').length == 0) {
						self.columnType = {};
						$(this).append(function() {
							var ret = $('<li pt="submit"></li>');

							var submit = $('<button>Submit</button>');
							submit.button({
								icons: {
									primary: "ui-icon-plus"
								},
								text: false
							}).click(function() {
								self._submit();
							});
							ret.append(submit);
							return ret;
						});
					}
					$(this).children().removeClass('ui-corner-bl ui-corner-br');
					$(this).children().first().addClass('ui-corner-bl');
					$(this).children().last().addClass('ui-corner-br');
					var index = 0;
					$(this).children().each(function() {
						if($(this).children().length == 0) {
							self.columnType[index] = $(this).attr('pt');
							if($(this).attr('pt')=='date') {
								$(this).append($('<input type="date">').attr('name',$(this).attr('name')));
							}
							if($(this).attr('pt')=='select') {
								var select = $('<select></select>').attr('name',$(this).attr('name'));
								$(this).append(select);
								var name = $(this).attr('name');
								if(self.options.select != null && self.options.select[name]!=null)
									$.each(self.options.select[name], function(i,o) {
										select.append($('<option></option>').text(o.label).val(o.value));
									});
							}
							if($(this).attr('pt')=='text') {
								$(this).append($('<input type="text">').attr('name',$(this).attr('name')));
							}
						}
						index+=1;
					});
				}
				
				
				$(this).children().addClass('ui-widget-header tableCell');
			});
			$(this.element).find('ul').each(function() {
				$(this).addClass('tableRow');
				$(this).children().addClass('tableCell ui-widget-content');
			});
			$(this.element).find('li').each(function() {
				if(!$(this).hasClass('tableCell')) {
					$(this).addClass('tableCell');
					$(this).addClass('ui-state-default');
					$(this).addClass('ui-widget-content');
				}
			});
		},
		_createRow: function(rowData) {
			var self = this;
			var row = $('<ul></ul>')
						.attr('table_id',rowData.id)
						.append(function() {
							var arr = [];
							$.each(rowData.columns, function(i,c) {
								var li = $('<li></li>')
											.text(c)
											.attr({
												'name' : function() {
													if(i < self.options.columnNames.length)
														return self.options.columnNames[i];
													return "";
												},
												'value' : function() {
													var ret = "";
													if(i < self.options.columnNames.length) {
														var name = self.options.columnNames[i];
														if(self.options.select[name]!=undefined) {
															$.each(self.options.select[name], function(oI, opt) {
																if(c==opt.label)
																	ret = opt.value;
															});
														}
													}
													return ret;
												}
											});
								arr.push(li);
							});
							
							return arr;
						});

			/*
			$.each(rowData.columns, function(cIndex, col) {
				var colDiv = $('<li></li>')
					.text(col);
				row.append(colDiv);
			});
			*/
			var opts = $('<li></li>');
			if($.isFunction(self.options.deleteCallback)) {
				var del = $('<button>Delete</button>').button({
					text: false,
					icons: {
						primary: "ui-icon-minus"
					}
				}).click(function() {
					self._delete(rowData.id);
				});
				opts.append(del);
			}
			if($.isFunction(self.options.editCallback)) {
				var edit = $('<button>Edit</button>').button({
					text: false,
					icons: {
						primary: "ui-icon-arrowreturnthick-1-w"
					}
				}).click(function() {
					self._edit(rowData.id);
				});
				opts.append(edit);
			}

			if(opts.children().length > 0)
				row.append(opts);

			return row;
		},
		_createEditRow: function(rowData) {
			var self = this;
			var row = $('<ul></ul>')
						.attr('table_id',rowData.id)
						.append(function() {
							var arr=[];
							$.each(rowData.columns, function(i,c) {
								arr.push($('<li>'+col+'</li>'));
							});
							return arr;
						});
			/*
			$.each(rowData.columns, function(cIndex, col) {
				var colDiv = $('<li></li>')
					.text(col);
				row.append(colDiv);
			});
			*/
			var opts = $('<li></li>');
			if($.isFunction(self.options.deleteCallback)) {
				var del = $('<button>Delete</button>').button({
					text: false,
					icons: {
						primary: "ui-icon-minus"
					}
				}).click(function() {
					self._delete(rowData.id);
				});
				opts.append(del);
			}
			if($.isFunction(self.options.editCallback)) {
				var edit = $('<button>Edit</button>').button({
					text: false,
					icons: {
						primary: "ui-icon-arrowreturnthick-1-w"
					}
				}).click(function() {
					self._edit(rowData.id);
				});
				opts.append(edit);
			}

			if(opts.children().length > 0)
				row.append(opts);

			return row;
		},
		addRow: function(data) {
			var newRow = this._createRow(data);
			$(this.element).append(newRow);
			this.refresh();
		},
		_submit: function() {
			var data = {};
			var row = null;
			$(this.element).find('ol').each(function() {
				if($(this).attr('pt')=="footer") {
					row = $(this);
					$(this).find('li').each(function() {
						$(this).children().each(function() {
							if($(this).is('button')==false)
								data[$(this).attr('name')]=$(this).val();
						});
					});
				}
			});

			if($.isFunction(this.options.submitCallback))
				this.options.submitCallback(row,data);
		},
		_delete: function(id) {
			var self = this;
			$(this.element).find('ul').each(function() {
				if($(this).attr('table_id')==id) {
					if($.isFunction(self.options.deleteCallback))
						if(self.options.deleteCallback(id)) {
							$(this).fadeTo(200,0,function() {
								$(this).remove();
							});
						}
				}
			});
		},
		_edit: function(id) {
			var self = this;
			$(this.element).find('ol').each(function() {
				if($(this).attr('table_id')==id) {
					var index = 0;
					if($.isFunction(self.options.editCallback)) {

					}
				}
			});
		}
	});
})
