(function($) {
  $(document).ready(function() {
  	var addon_script_delay_2 = typeof  moove_frontend_gdpr_scripts !== 'undefined' && typeof moove_frontend_gdpr_scripts.script_delay !== 'undefined' && parseInt( moove_frontend_gdpr_scripts.script_delay ) ? parseInt( moove_frontend_gdpr_scripts.script_delay ) : 0;

  	function addon_script_2_init() {
  		try	{

	  		if ( typeof moove_frontend_gdpr_scripts.ifbc !== 'undefined' ) {
	  			if ( typeof moove_frontend_gdpr_scripts.ifbc_excl !== 'undefined' ) {
						var ifb_excl 	= JSON.parse( moove_frontend_gdpr_scripts.ifbc_excl );
					} else {
						var ifb_excl = {};
					}
	  			function gdpr_ifbc_js_block_iframes( ) {
	  				$(document).find('iframe').each(function() {
	  					if ( ! $(this).attr('data-gdpr-iframesrc') ) {
	  						var src 			= $(this).attr('src');
	  						if ( src ) {
	  							var change_iframe = true;
	  							for (var i = ifb_excl.length - 1; i >= 0; i--) {
	  								if (  src.indexOf( ifb_excl[i] ) >= 0 ) {
	  									change_iframe = false;
	  								}
	  							}

	  							if ( change_iframe ) {
		    						var gdpr_src 	= moove_frontend_gdpr_scripts.ajaxurl;
		    						var block_src = gdpr_src + '?action=gdpr_iframe_blocker&src=' + src;
		    						$(this).attr('src', block_src);
		    						$(this).attr('data-gdpr-iframesrc', src);
		    						$(this).closest('.fb-video').addClass('fb-blocked-gdpr');
		    					}
	    					}
	  					}
	  				});
	  			}
	  			
	  			function gdpr_restrict_iframes() {
	  				if ( typeof $(document).moove_gdpr_read_cookies !== 'undefined' ) {
		    			var cookies = $(document).moove_gdpr_read_cookies();
		    			if ( cookies ) {
			          if ( moove_frontend_gdpr_scripts.ifbc === 'strict' && cookies && parseInt( cookies.strict ) === 0 ) {
			          	gdpr_ifbc_js_block_iframes();
			          }

			          if ( moove_frontend_gdpr_scripts.ifbc === 'thirdparty' && cookies && parseInt( cookies.thirdparty ) === 0 ) {
			          	gdpr_ifbc_js_block_iframes();
			          }

			          if ( moove_frontend_gdpr_scripts.ifbc === 'advanced' && cookies && parseInt( cookies.advanced ) === 0 ) {
			          	gdpr_ifbc_js_block_iframes();
			          }
			        } else {
			        	gdpr_ifbc_js_block_iframes();
			        }
			      }
	  			}
	  			gdpr_restrict_iframes();

		      var gdpr_observe_DOM = (function(){
				  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

				  return function( obj, callback ){
				    if( !obj || obj.nodeType !== 1 ) return; 

				    if( MutationObserver ){
				      // define a new observer
				      var mutationObserver = new MutationObserver(callback)

				      // have the observer observe for changes in children
				      mutationObserver.observe( obj, { childList:true, subtree:true })
				      return mutationObserver
				    }
				    
				    // browser support fallback
				    else if( window.addEventListener ){
				      obj.addEventListener('DOMNodeInserted', callback, false)
				      obj.addEventListener('DOMNodeRemoved', callback, false)
				    }
				  }
				})();

				gdpr_observe_DOM( document.getElementsByTagName("html")[0], function(m){ 
				  var addedNodes = [];

				  m.forEach(record => record.addedNodes.length & addedNodes.push(...record.addedNodes))
				   
				  if ( addedNodes && addedNodes.length > 0 ) {
				  	addedNodes.forEach(item => {
				  		if ( item.tagName === 'IFRAME' ) {
				  			gdpr_restrict_iframes();
				  		}
				  	});
				  }
				});

	      }
	  	} catch( err ) {
	  		console.warn(err);
	  	}

	  	function gdpr_cookie_compliance_setup_get_session( event_type ) {
	  		var gdpr_uvid_session = false;
	  		
	  		if ( typeof( sessionStorage ) !== "undefined" ) {
	  			gdpr_uvid_session = sessionStorage.getItem("gdpr_uvid");
	  			if ( ! gdpr_uvid_session ) {
	  				sessionStorage.setItem( "gdpr_uvid", moove_frontend_gdpr_scripts.gdpr_uvid );
	  				gdpr_uvid_session = sessionStorage.getItem("gdpr_uvid");
	  			}				
				}
			
				return gdpr_uvid_session;
	  	}
	  	
	  	function gdpr_cookie_compliance_get_cookies(){
		  	var pairs = document.cookie.split(";");
		  	var cookies = {};
		  	for (var i=0; i<pairs.length; i++){
		    	var pair = pairs[i].split("=");
		    	cookies[(pair[0]+'').trim()] = unescape(pair[1]);
		  	}
		  	return cookies;
			}

			$(document).on('click','.gdpr-cd-details-toggle', function(e){
				e.preventDefault();
				var _this = $(this);
				var text = _this.text();
				var text2 = _this.attr('data-close');
				_this.text(text2).append('<span></span>');
				_this.attr('data-close',text);
				_this.toggleClass('cd-details-open');
				_this.parent().find('.gdpr-table-responsive-cnt').toggle();

			});

			function gdpr_cookie_compliance_set_cookies(name, value, days){
		  	var expires;
	      if (days) {
	        var date = new Date();
	        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	        expires = "; expires=" + date.toGMTString();
	      } else {
	        expires = "";
	      }

	      document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
	      (JSON.parse(value));
			}

			var started = false;
			var timeout_req = 200;
			var gdpr_timeout = 0;
			var analytics_inserted = [];
			$.fn.gdpr_cookie_compliance_analytics = function(event, extras) {
				if ( typeof ( analytics_inserted[event] ) === 'undefined' || analytics_inserted[event] !== JSON.stringify( extras ) ) {
					analytics_inserted[event] = JSON.stringify( extras );
					if ( moove_frontend_gdpr_scripts.stats_enabled ) {
						var gdpr_uvid_session = gdpr_cookie_compliance_setup_get_session( event );			

						if ( !started ) {
							gdpr_timeout = 0;
						} else {
							gdpr_timeout = gdpr_timeout + timeout_req;
						}
						started = true;

						if ( event === 'script_inject' ) {
				    		if ( typeof( localStorage ) !== "undefined" ) {
				    			gdpr_uvid_session = localStorage.getItem("gdpr_uvid");
				    			if ( ! gdpr_uvid_session ) {
				    				localStorage.setItem( "gdpr_uvid", moove_frontend_gdpr_scripts.gdpr_uvid );
				    				gdpr_uvid_session = sessionStorage.getItem("gdpr_uvid");
				    			} else {
				    				if ( typeof( sessionStorage ) !== "undefined" ) {
						    			_gdpr_uvid_session = sessionStorage.getItem("gdpr_uvid");
						    			if ( ! _gdpr_uvid_session ) {
						    				_gdpr_uvid_session.setItem( "gdpr_uvid", moove_frontend_gdpr_scripts.gdpr_uvid );
						    				gdpr_uvid_session = sessionStorage.getItem("gdpr_uvid");
						    			}
						    			_event 		= 'existing_session';
						    			_extras 	= '';
						    			try {
						            jQuery().gdpr_cookie_compliance_analytics_with_uvid( _event, _extras, _gdpr_uvid_session );
						            jQuery().gdpr_cookie_compliance_analytics_with_uvid( 'script_injected', extras, _gdpr_uvid_session );
							        } catch(err) {
							        	// error
							        }
										}		
				    			}				
							}				
						} 
						setTimeout( function(){	
							if ( gdpr_uvid_session && event ) {
								$.post(
					              	moove_frontend_gdpr_scripts.ajaxurl,
					              	{
						                action: 	"moove_gdpr_premium_save_analytics",
						                event: 		event,
						                extras: 	extras,
						                gdpr_uvid: 	gdpr_uvid_session,
						            },
					              	function( msg ) {
					              		// console.warn(gdpr_uvid_session);
					              		if ( gdpr_timeout >= timeout_req ) {
					              			gdpr_timeout = gdpr_timeout - timeout_req;
					              		}
					              	}
					            );
							}
						}, gdpr_timeout );	
					}
				}
			}	

			$.fn.gdpr_cookie_compliance_consent_log = function( value ) {
				if ( moove_frontend_gdpr_scripts.consent_log_enabled ) {
					$.post(
	        	moove_frontend_gdpr_scripts.ajaxurl,
	        	{
	            action: 	"save_consent_log",
	            extras: 	value,
	        	},
	        	function( msg ) {
	        		console.warn( msg );
	        	}
	      	);
				}
			}	

			$.fn.gdpr_cookie_compliance_analytics_with_uvid = function(event, extras, uvid) {
				if ( moove_frontend_gdpr_scripts.stats_enabled ) {
					var gdpr_uvid_session = uvid;				
					if ( !started ) {
						gdpr_timeout = 0;
					} else {
						gdpr_timeout = gdpr_timeout + timeout_req;
					}
					started = true;

					setTimeout( function(){	
						if ( gdpr_uvid_session && event ) {
							$.post(
	            	moove_frontend_gdpr_scripts.ajaxurl,
	            	{
	                action: 	"moove_gdpr_premium_save_analytics",
	                event: 		event,
	                extras: 	extras,
	                gdpr_uvid: 	gdpr_uvid_session,
	            	},
	            	function( msg ) {
	            		// console.warn(gdpr_uvid_session);
	            		if ( gdpr_timeout >= timeout_req ) {
	            			gdpr_timeout = gdpr_timeout - timeout_req;
	            		}
	            	}
	          	);
						}
					}, gdpr_timeout );
					
				}
			}
  	}

  	if ( addon_script_delay_2 > 0 ) {
			setTimeout( function(){
				addon_script_2_init()
			}, addon_script_delay_2 );
		} else {
			addon_script_2_init();
		}
 	});
})(jQuery);