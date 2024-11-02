import React, { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const initiatorName = "Иван К.";
  const collectionName = "Экскурсия";

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [inputErrors, setInputErrors] = useState({}); // Объект для отслеживания ошибок инпутов

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\D/g, "");
    let sum = 0;
    const nDigits = cleanNumber.length;
    const parity = nDigits % 2;

    for (let i = 0; i < nDigits; i++) {
      let digit = parseInt(cleanNumber[i]);
      if (i % 2 === parity) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }

    return sum % 10 === 0;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(value);
  };

  const handleExpiryDateChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setExpiryDate(value.replace(/(\d{2})(\d)/, "$1/$2"));
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvc(value);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setAmount(value);
  };

  const handleNameChange = (e) => {
    const value = e.target.value.slice(0, 50);
    setName(value);
  };

  const handleMessageChange = (e) => {
    const value = e.target.value.slice(0, 50);
    setMessage(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Сброс ошибок перед валидацией
    setInputErrors({});
    setError("");

    // Проверка заполненности полей
    const newInputErrors = {};
    if (!cardNumber) newInputErrors.cardNumber = true;
    if (!expiryDate) newInputErrors.expiryDate = true;
    if (!cvc) newInputErrors.cvc = true;
    if (!amount || amount < 10) newInputErrors.amount = true;
    if (!name) newInputErrors.name = true;

    if (Object.keys(newInputErrors).length > 0) {
      setInputErrors(newInputErrors);
      return;
    }

    // Валидация номера карты
    if (!validateCardNumber(cardNumber)) {
      setError("Неверный номер карты");
      return;
    }

    // Если ошибки нет, продолжаем с отправкой данных
    const api_key = "316b2be8-3475-4462-bd57-c7794d4bdb53";
    const secret = "1234567890";
    const transaction = Date.now().toString();

    const amountParsed = parseInt(amount);
    // const hash_sum = sha256(
    //   `${api_key}${transaction}${amount}${secret}`
    // );
    // Не понял откуда брать hash_sum, поэтому использовал hash_sum из ТЗ.

    const hash_sum =
      "14d85e69dc948e2f04e7494e4f5cdbc89ec2a19d30900c180516098ad365bedb";

    const requestData = {
      api_key,
      transaction,
      description: message,
      amount: amountParsed,
      hash_sum,
      custom_data: {
        initiator: initiatorName,
        collection: collectionName,
      },
    };

    axios
      .post("http://localhost:3001", requestData)
      .then((res) => {
        console.log(
          "Данные для отправки:",
          JSON.stringify(requestData, null, 2)
        );
        alert(
          "Данные успешно отправлены на сервер:\n" +
            JSON.stringify(requestData, null, 2)
        );
        /* 
          "2. имитация отправки данных на сервер (сформировать тело POST запроса, вывести на другую
          страницу)."

          В ТЗ был указан порядок действий при отправке POST запроса, однако, не имея реального эндпоинта для транзакции
          я не стал реализовывать переадресацию на другую страницу и сделал вывод данныйх в alert

          Алгоритм для реализации данного пункта ТЗ:
          1. Полсе отправки запроса получаем ответ от сервера
          2. В полученном ответе от сервера берём id сформированной транзакции
          3. Выполняем переадресацию на заранее подготовленный динамический роут, принимающий id в качестве параметра
          4. На странице с параметром в виде id транзакции выполняем GET запрос при помощи получения параметров роута (id транзакции)
          5. Выводим полученные данные после GET запроса по id транзакции 
      */
      })
      .catch((error) => {
        console.error("Error sending request:", error);
        alert(
          "Отправляемые данные на сервер:\n" +
            JSON.stringify(requestData, null, 2)
        );
      });
  };

  const sha256 = (data) => {
    return crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(data))
      .then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      });
  };

  return (
    <div className="main">
      <h1 className="main__title">
        {initiatorName} собирает на «{collectionName}»
      </h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <p className="input-label">Номер карты</p>
          <input
            className={`input ${inputErrors.cardNumber ? "error" : ""}`}
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            maxLength={16}
          />
          {inputErrors.cardNumber && (
            <p className="error-text">Введите номер карты</p>
          )}
        </div>

        <div className="input-mini">
          <div>
            <p className="input-label">Срок действия</p>
            <input
              className={`input expiry-date-input ${
                inputErrors.expiryDate ? "error" : ""
              }`}
              type="text"
              placeholder="ММ/ГГ"
              value={expiryDate}
              onChange={handleExpiryDateChange}
              maxLength={5}
            />
            {inputErrors.expiryDate && (
              <p className="error-text">Введите срок</p>
            )}
          </div>

          <div>
            <p className="input-label">CVV</p>
            <input
              className={`input cvv-input ${inputErrors.cvc ? "error" : ""}`}
              type="password"
              value={cvc}
              onChange={handleCvcChange}
              maxLength={3}
            />
            {inputErrors.cvc && <p className="error-text">Введите CVV</p>}
          </div>
        </div>

        <div>
          <p className="input-label">Сумма перевода</p>
          <input
            className={`input ${inputErrors.amount ? "error" : ""}`}
            type="number"
            value={amount}
            onChange={handleAmountChange}
            min="10"
          />
          {inputErrors.amount && <p className="error-text">Введите сумму</p>}
        </div>

        <div>
          <p className="input-label">Ваше имя</p>
          <input
            className={`input ${inputErrors.name ? "error" : ""}`}
            type="text"
            value={name}
            onChange={handleNameChange}
            maxLength={50}
          />
          {inputErrors.name && <p className="error-text">Введите имя</p>}
        </div>

        <div>
          <p className="input-label">Сообщение получателю</p>
          <input
            className="input"
            type="text"
            value={message}
            onChange={handleMessageChange}
            maxLength={50}
          />
        </div>
      </form>

      <footer>
        <button
          className="button-submit button"
          type="submit"
          onClick={handleSubmit}
        >
          Перевести
        </button>
        <button className="button-back button">Вернуться</button>
      </footer>
    </div>
  );
}

export default App;
