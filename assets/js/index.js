let ThemeJS = {
  bigImgEl: null,
  numImgs: null,

  init: () => {
    setTimeout(ThemeJS.initNavbar, 10);

    // Shorten the navbar after scrolling a little bit down
    $(window).scroll(() => {
      if ($(".navbar").offset().top > 50) {
        $(".navbar").addClass("top-nav-short");
      } else {
        $(".navbar").removeClass("top-nav-short");
      }
    });

    // On mobile, hide the avatar when expanding the navbar menu
    $("#main-navbar").on("show.bs.collapse", () => {
      $(".navbar").addClass("top-nav-expanded");
    });

    $("#main-navbar").on("hidden.bs.collapse", () => {
      $(".navbar").removeClass("top-nav-expanded");
    });

    // show the big header image
    ThemeJS.initImgs();
  },

  initNavbar: () => {
    // Set the navbar-dark/light class based on its background color
    const rgb = $(".navbar")
      .css("background-color")
      .replace(/[^\d,]/g, "")
      .split(",");

    const brightness = Math.round(
      // http://www.w3.org/TR/AERT#color-contrast
      (parseInt(rgb[0]) * 299 +
        parseInt(rgb[1]) * 587 +
        parseInt(rgb[2]) * 114) /
        1000,
    );

    if (brightness <= 125) {
      $(".navbar").removeClass("navbar-light").addClass("navbar-dark");
    } else {
      $(".navbar").removeClass("navbar-dark").addClass("navbar-light");
    }
  },

  initImgs: () => {
    // If the page was large images to randomly select from, choose an image
    if ($("#header-big-imgs").length > 0) {
      ThemeJS.bigImgEl = $("#header-big-imgs");
      ThemeJS.numImgs = ThemeJS.bigImgEl.attr("data-num-img");

      // set an initial image
      const imgInfo = ThemeJS.getImgInfo();
      const src = imgInfo.src;
      const desc = imgInfo.desc;
      ThemeJS.setImg(src, desc);

      // For better UX, prefetch the next image so that it will already be loaded when we want to show it
      const getNextImg = () => {
        const imgInfo = ThemeJS.getImgInfo();
        const src = imgInfo.src;
        const desc = imgInfo.desc;

        const prefetchImg = new Image();
        prefetchImg.src = src;

        // if I want to do something once the image is ready: `prefetchImg.onload = function(){}`
        setTimeout(() => {
          const img = $("<div></div>")
            .addClass("big-img-transition")
            .css("background-image", `url(${src})`);

          $(".intro-header.big-img").prepend(img);

          setTimeout(() => {
            img.css("opacity", "1");
          }, 50);

          // after the animation of fading in the new image is done, prefetch the next one
          //img.one("transitioned webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
          setTimeout(() => {
            ThemeJS.setImg(src, desc);
            img.remove();
            getNextImg();
          }, 1000);
          //});
        }, 6000);
      };

      // If there are multiple images, cycle through them
      if (ThemeJS.numImgs > 1) {
        getNextImg();
      }
    }
  },

  getImgInfo: () => {
    const randNum = Math.floor(Math.random() * ThemeJS.numImgs + 1);
    const src = ThemeJS.bigImgEl.attr(`data-img-src-${randNum}`);
    const desc = ThemeJS.bigImgEl.attr(`data-img-desc-${randNum}`);

    return {
      src: src,
      desc: desc,
    };
  },

  setImg: (src, desc) => {
    $(".intro-header.big-img").css("background-image", `url(${src})`);

    if (typeof desc != "undefined" && desc !== false) {
      $(".img-desc").text(desc).show();
    } else {
      $(".img-desc").hide();
    }
  },
};

document.addEventListener("DOMContentLoaded", ThemeJS.init);
