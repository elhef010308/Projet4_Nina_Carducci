(function($) {

  // INITIALISATION DE LA GALERIE
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];

    // INITIALISATOON DE LA GALERIE POUR CHAQUE ÉLÉMENT SÉLECTIONNÉ
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));

      // CRÉATION DE LA LIGHTBOX
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      // INITIALISATION DES ÉVÈNEMENTS D'ÉCOUTE
      $.fn.mauGallery.listeners(options);

      // PARCOURIR LES ÉLÉMENTS DE LA GALERIE
      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);

          // COLLECTE DES CATÉGORIES DES ÉLÉMENTS DE LA GALERIE
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      // AFFICHER LES TAGS (si activés dans les options)
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }
      $(this).fadeIn(500);
    });
  };

  // OPTIONS PAR DÉFAUT POUR LA GALERIE 
  $.fn.mauGallery.defaults = {
    columns: 3,                  /* Nombre de colonnes*/
    lightBox: true,              /* Activation de la lightbox */
    lightboxId: null,            /* Identifiant de la lightbox */
    showTags: true,              /* Afficher (ou non) les tags */
    tagsPosition: "bottom",      /* Position des tags (bas par défaut) */
    navigation: true             /* Activer la navigation dans la lightbox */
  };

  // ÉCOUTEUR D'ÉVÈNEMENTS
  $.fn.mauGallery.listeners = function(options) {

    // CLIC SUR UN ÉLÉMENT DE LA GALERIE POUR OUVRIR LA LIGHTBOX
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // CLIC SUR UN TAG POUR FILTRER LES IMAGES
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    // NAVIGATION DANS LA LIGHTBOX (image précédente)
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );

    // NAVIGATION DANS LA LIGHTBOX (image suivante)
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  $.fn.mauGallery.methods = {

    // CRÉER L'ENVELOPPE DE LIGNE POUR LES ÉLÉMENTS DE LA GALERIE
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    // AJOUT D'ÉLÉMENT DANS UNE COLONNE
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    // DÉPLACER UN ÉLÉMENT DANS L'ENVELOPPE DE LIGNE 
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    // AJOUT D'UNE CLASSE RESPONSIBLE A UNE IMAGE
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    // OUVERTURE DE LA LIGHTBOX
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    // NAVIGATION VERS L'IMAGE PRÉCÉDENTE
    prevImage() {
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i - 1;
        }
      });
      next =
        imagesCollection[index] ||
        imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },

    // NAVIGATION VERS L'IMAGE SUIVANTE
    nextImage() {
      let activeImage = null;

      /* Parcourir toutes les images de la galerie */
      $("img.gallery-item").each(function() {   
        
        /* Comparer la src de chaque image à celle actuellement affichée dans la lightbox */
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {

          /* Si une image est trouvée on la stockes dans "activeImage" */
          activeImage = $(this);
        }
      });

      /* Récupérer le tag actuellement actif */
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      
      /* Construire un tableau d'images */
      let imagesCollection = [];

      /* Ajouter toutes les images si le tag est "all" */
      if (activeTag === "all") {

        /* Sélectionner chaque conteneur d'image */
        $(".item-column").each(function() {

          /* Récupérer l'image dans le conteneur */
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")

              /* Vérifier si le tag de l'image correspond au tag actif */
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }

      /* Une fois l'image trouvée, son index est stocké dans la variable "index" */
      let index = 0,
        next = null;

      /* Parcourir toutes les images collectées */
      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i + 1;
        }
      });

      /* Déterminer quelle image afficher ensuite */
      next = imagesCollection[index] || imagesCollection[0];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },

    // CRÉATION DE LA LIGHTBOX
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },

    // AFFICHAGE DES TAGS DE LA GALERIE
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    // FILTRAGE DES IMAGES PAR TAG
    filterByTag() {

      /* Vérifier sur le bouton est déjà actif */
      if ($(this).hasClass("active-tag")) {
        return;
      }

      /* Enlever les classes ACTIVE et ACTIVE-TAG de l'ancien bouton actif */
      /* Ajouter ces mêmes classes au bouton cliqué  */
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active active-tag");               /***** AJOUT de la classe "active" *****/

      /* Récupérer le tag à filtrer */
      var tag = $(this).data("images-toggle");

      /* Parcourir tous les éléments de la galerie */
      $(".gallery-item").each(function() {

        /* Cacher tous les éléments au départ */
        $(this)
          .parents(".item-column")
          .hide();

        /* Afficher les éléments correspondants au TAG */
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);
