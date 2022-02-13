import "./index.css";
import Api from "../components/Api.js";
import Card from "../components/Card.js";
import Section from "../components/Section.js";
import UserInfo from "../components/UserInfo.js";
import FormValidator from "../components/FormValidator.js";
import PopupWithForm from "../components/PopupWithForm.js";
import PopupWithImage from '../components/PopupWithImage.js'
import PopupSubmit from "../components/PopupSubmit.js";
import {
  formAddCard,
  formEditAvatar,
  formProfileEdit,
  addCardBtn,
  editAvatarBtn,
  editProfileBtn,
  usernameInput,
  aboutInput,
  validationObj,
  submitChangeAvatarBtn,
} from "../utils/constants.js";

console.log(': ', submitChangeAvatarBtn);


const api = new Api({
  baseUrl: 'https://mesto.nomoreparties.co/v1/cohort-35',
  headers: {
    authorization: 'e3cd37b0-56ab-40c1-b26c-66c00d48e156',
    'Content-Type': 'application/json'
  }
})

const cardList = new Section({
  renderer: item => {
    const cardElement = createCard(item, 'card');
    cardList.addItem(cardElement);
  }
}, '.cards')

api.getInitialCards()
  .then(initialCards => cardList.renderItems(initialCards))
  .catch(err => console.log(`Ошибка при создании всех карточек: ${err}`));

const popupAddCard = new PopupWithForm({
  popupSelector: '.popup_card-add',
  handleFormSubmit: formData => {
    api.addItem({
      name: formData['name-card_input'],
      link: formData['link-card_input']
    })
      .then(newCardObj => {
        const cardElement = createCard(newCardObj, 'card');
        cardList.addItem(cardElement, true);
        popupAddCard.close();
      })
      .catch(err => console.log(`Ошибка при создании новой карточки: ${err}`));
  },
})
popupAddCard.setEventListeners();

api.getUserInfo()
  .then(({ name, about, avatar }) => {
    userInfo.setUserInfo({ name, about });
    userInfo.setUserAvatar(avatar);
  })
  .catch(err => console.log(`Ошибка при загрузке информации о пользователе: ${err}`));

const popupEditProfile = new PopupWithForm({
  popupSelector: '.popup-profile-edit',
  handleFormSubmit: formValues => {
    api.setUserInfo({
      name: formValues['name-edit_input'],
      about: formValues['about-edit_input']
    })
      .then(() => {
        userInfo.setUserInfo({
          name: formValues['name-edit_input'],
          about: formValues['about-edit_input']
        })
        popupEditProfile.close();
      })
      .catch(err => console.log(`Ошибка при обновлении данных пользователя: ${err}`));
  }
})
popupEditProfile.setEventListeners();

const popupImage = new PopupWithImage('.popup_card-fullscreen');
popupImage.setEventListeners();

const popupCardDelete = new PopupSubmit(
  '.popup_card-delete-confirm', {
  handleSubmit: () => {
    popupCardDelete.submitAction();
    // popupCardDelete.close();
  }
})
popupCardDelete.setEventListeners();

const createCard = (cardObj, selector) => {
  const card = new Card(cardObj, selector, {
    handleCardClick: () => popupImage.open(cardObj),
    handleDeleteCard: () => {
      popupCardDelete.setSubmitAction({
        handleSubmitAction: () => {
          api.deleteItem(card.getId())
            .then(() => {
              card.deleteCard();
              popupCardDelete.close();
            })
            .catch(err => console.log(`Ошибка при удалении карточки: ${err}`));
        }
      })
      popupCardDelete.open()
    },
    handleChangeLikeStatus: () => {
      if (card.getLikeStatus()) {
        api.addLike(card.getId())
          .then(cardLiked => card.updateLike(cardLiked.likes))
          .catch(err => console.log(`Ошибка при добавлении лайка: ${err}`));
      } else {
        api.deleteLike(card.getId())
          .then(cardLiked => card.updateLike(cardLiked.likes))
          .catch(err => console.log(`Ошибка при удалении лайка: ${err}`));
      }
    }
  });
  const username = userInfo.getUserInfo().name;
  const isOwner = cardObj.owner.name === username;
  const isLiked = cardObj.likes.some(item => item.name === username);
  return card.generateCard(isOwner, isLiked);
}

const renderSaving = isSaving => {
  if (isSaving) {
    submitChangeAvatarBtn.textContent = "Сохранение...";
  } else {
    submitChangeAvatarBtn.textContent = "Сохранить";
  }
}

const popupEditAvatar = new PopupWithForm({
  popupSelector: '.popup_edit-avatar',
  handleFormSubmit: formValues => {
    renderSaving(true);
    api.setAvatar({
      avatar: formValues['link-avatar_input']
    })
      .then(() => {
        userInfo.setUserAvatar(formValues['link-avatar_input']);
        popupEditAvatar.close();
      })
      .catch(err => console.log(`Ошибка при обновлении аватара: ${err}`))
      .finally(() => renderSaving(false));
  }
})
popupEditAvatar.setEventListeners();

const userInfo = new UserInfo({
  nameSelector: '.profile__name',
  aboutSelector: '.profile__about',
  avatarSelector: '.profile__avatar'
})

const fillInputsUserData = () => {
  const { name, about } = userInfo.getUserInfo();
  usernameInput.value = name;
  aboutInput.value = about;
}

const openProfileEditPopup = () => {
  fillInputsUserData();
  formProfileEditValid.resetValidation();
  popupEditProfile.open();
}

const openAddCardPopup = () => {
  formAddCardValid.resetValidation();
  popupAddCard.open();
}

const openEditAvatarPopup = () => {
  formEditAvatarValid.resetValidation();
  popupEditAvatar.open()
}

const formProfileEditValid = new FormValidator(validationObj, formProfileEdit);
const formAddCardValid = new FormValidator(validationObj, formAddCard);
const formEditAvatarValid = new FormValidator(validationObj, formEditAvatar);
formProfileEditValid.enableValidation();
formAddCardValid.enableValidation();
formEditAvatarValid.enableValidation();

editProfileBtn.addEventListener("click", openProfileEditPopup);
addCardBtn.addEventListener("click", openAddCardPopup);
editAvatarBtn.addEventListener("click", openEditAvatarPopup);