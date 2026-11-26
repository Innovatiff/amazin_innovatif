'use strict';

const faqQuestionList = document.querySelector('.faq__questions--list');

if (faqQuestionList) {
  faqQuestionList.addEventListener('click', function (e) {
    const clickedQuestion = e.target.closest('.faq__questions--question');

    if (!clickedQuestion) return;

    const allQuestions = faqQuestionList.querySelectorAll('.faq__questions--question');

    allQuestions.forEach(function (question) {
      if (question !== clickedQuestion) {
        question.classList.remove('faq__questions--question-active');

        question.querySelector('.faq__questions--icon').classList.remove('faq__questions--icon-active');

        question.querySelector('.faq__questions--ask').classList.remove('faq__questions--ask-active');

        question.querySelector('.faq__questions--answers').classList.add('faq__questions--answers-hidden');

        question.querySelector('.faq__questions--line').classList.remove('faq__questions--line-active');
      }
    });

    clickedQuestion.classList.toggle('faq__questions--question-active');

    clickedQuestion.querySelector('.faq__questions--icon').classList.toggle('faq__questions--icon-active');

    clickedQuestion.querySelector('.faq__questions--ask').classList.toggle('faq__questions--ask-active');

    clickedQuestion
      .querySelector('.faq__questions--answers')
      .classList.toggle('faq__questions--answers-hidden');

    clickedQuestion.querySelector('.faq__questions--line').classList.toggle('faq__questions--line-active');
  });
}
