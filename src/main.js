import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.load-more');

const API_KEY = '56419387-b9216e8761a1aa448b5b4bea2';
let query = '';
let page = 1;
const perPage = 40;

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();
  query = e.currentTarget.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.warning({
      message: 'Please enter a search term.',
      position: 'topRight',
    });
    return;
  }

  page = 1;
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';
  loader.style.display = 'block';

  try {
    const data = await fetchImages(query, page);
    loader.style.display = 'none';

    if (data.hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
        backgroundColor: '#ef4040',
        messageColor: '#fff',
      });
      return;
    }

    renderGallery(data.hits);
    lightbox.refresh();

    if (page * perPage < data.totalHits) {
      loadMoreBtn.style.display = 'block';
    } else {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }
  } catch (error) {
    loader.style.display = 'none';
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong while fetching data.',
      position: 'topRight',
    });
  }

  form.reset();
}

async function onLoadMore() {
  page += 1;
  loadMoreBtn.style.display = 'none';
  loader.style.display = 'block';

  try {
    const data = await fetchImages(query, page);

    renderGallery(data.hits);
    lightbox.refresh();
    loader.style.display = 'none';

    smoothScroll();

    if (page * perPage >= data.totalHits) {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
        backgroundColor: '#0099FF',
        messageColor: '#fff',
      });
    } else {
      loadMoreBtn.style.display = 'block';
    }
  } catch (error) {
    loader.style.display = 'none';
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong while fetching data.',
      position: 'topRight',
    });
  }
}

async function fetchImages(searchQuery, currentPage) {
  const url = `https://pixabay.com/api/`;
  const response = await axios.get(url, {
    params: {
      key: API_KEY,
      q: searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: currentPage,
      per_page: perPage,
    },
  });
  return response.data;
}

function renderGallery(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
    <li class="gallery-item">
      <a class="gallery-link" href="${largeImageURL}">
        <img class="gallery-image" src="${webformatURL}" alt="${tags}" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes</b><span>${likes}</span></p>
        <p class="info-item"><b>Views</b><span>${views}</span></p>
        <p class="info-item"><b>Comments</b><span>${comments}</span></p>
        <p class="info-item"><b>Downloads</b><span>${downloads}</span></p>
      </div>
    </li>
  `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

function smoothScroll() {
  const galleryItem = document.querySelector('.gallery-item');
  if (galleryItem) {
    const { height } = galleryItem.getBoundingClientRect();
    window.scrollBy({
      top: height * 2,
      behavior: 'smooth',
    });
  }
}
