import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const KEY = '36285861-168bae95e05873f7547dc914e';
const API_URL = 'https://pixabay.com/api/?';
let page = 1;
let perPage = 40;
let existsPhotos = [];

const formEl = document.getElementById('search-form');
// const buttonEl = document.querySelector('.search-button');
const inputEl = document.querySelector('input[type="text"]');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const fetchPhotos = async () => {
  const data = await axios.get(API_URL, {
    params: {
      key: KEY,
      q: inputEl.value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: perPage,
    },
  });
  return data;
};

const loadPhotos = () => {
  fetchPhotos()
    .then(photos => {
      //   całkowity wyniki kilka tys:
      console.log(photos.data.total);
      //   całkowity wyniki na 1 zapytanie 500 recordów
      console.log(photos.data.totalHits);

      let result = photos.data.totalHits;

      const clearSearch = () => (inputEl.value = '');

      if (result === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else if (result <= page * perPage) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      } else {
        Notiflix.Notify.success(`Hooray! We found ${result} images.)`);
        console.log(photos);
        galleryEl.innerHTML = showPhotoCards(photos);
        let gallery = new SimpleLightbox('.gallery a');
        gallery.on('show.simplelightbox');
        loadMoreBtn.classList.remove('is-hidden');

        if (page >= 1) {
          gallery.refresh();
          console.log('galeryrefresh');

          const { height: cardHeight } = document
            .querySelector('.gallery')
            .firstElementChild.getBoundingClientRect();
          window.scrollBy({
            top: cardHeight * 4,
            behavior: 'smooth',
          });
        }
      }
    })
    .catch(error => console.log(error));
};

formEl.addEventListener('submit', event => {
  event.preventDefault();
  loadPhotos();
});

function showPhotoCards(photos) {
  const arrayOfPhotos = photos.data.hits;
  existsPhotos.push(...arrayOfPhotos);

  return existsPhotos
    .map(
      card => `
      <div class="photo-card">
        <div class="photo-small">
          <a href="${card.largeImageURL}">
            <img src="${card.webformatURL}" width="100%" alt="${card.tags}" loading="lazy" />
          </a>
        </div>
        
        <div class="info">
           <p class="info-item">
             <b>Likes:<br>${card.likes}</b>
           </p>
           <p class="info-item">
             <b>Views:<br>${card.views}</b>
           </p>
           <p class="info-item">
             <b>Comments:<br>${card.comments}</b>
           </p>
           <p class="info-item">
             <b>Downloads:<br>${card.downloads}</b>
           </p>
        </div>
       </div>`
    )
    .join('');
}

loadMoreBtn.addEventListener('click', event => {
  event.preventDefault();
  page++;

  loadPhotos();
});