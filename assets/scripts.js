/* 
    Attendre que le DOM soit entièrement chargé grâce à :
    $(document).ready 

    Cibler la galerie et initialiser le plugin mauGallery
    avec une configuration spécifique :
        --> COLUMNS définit le nombre de colonne pour afficher les images
            selon la taille de l'écran
        --> LIGHTBOX active une visionneuse pour agrandir les images
        --> SHOWTAGS affiche des filtres au-dessus de la galerie
        --> TAGSPOSITION positionne les filtres

    Le sige "$" est une syntaxe jQuery (bibliothèque JS simplifiant la manipulation du DOM)
 */


$(document).ready(function() {
    $('.gallery').mauGallery({
        columns: {
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 3
        },
        lightBox: true,
        lightboxId: 'myAwesomeLightbox',
        showTags: true,
        tagsPosition: 'top',
        navigation: true,       // Ajout explicite pour garantir que les boutons SUIVANT/PRÉCÉDENT fonctionnent
    });
});
