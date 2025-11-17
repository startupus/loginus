import React, { useState } from "react";

const SelectBox3 = () => {
  return (
    <section className="bg-gray-2 py-20 dark:bg-dark lg:py-[120px]">
      <div className="container mx-auto">
        <div>
          <h3 className="mb-6 text-lg font-semibold text-dark dark:text-white">
            Shipping Address
          </h3>
          <div className="flex flex-wrap">
            <SelectBoxItem
              name="one"
              id="one"
              title="Same as Personal"
              address1="New York, USA"
              address2="2707 Davis Anenue"
            />
            <SelectBoxItem
              name="one"
              id="two"
              title="Standard Shipping"
              subtitle="Create an account now to have multiple address."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SelectBox3;

const SelectBoxItem = ({ id, name, address1, address2, title, subtitle }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="mr-6 w-full max-w-[240px]">
      <div className="mb-3">
        <input
          type="radio"
          name={name}
          id={id}
          className="select-box shipping sr-only"
          onChange={() => {
            setIsChecked(!isChecked);
          }}
        />
        <label
          htmlFor={id}
          className="block cursor-pointer overflow-hidden rounded-lg border border-stroke bg-white px-4 py-5 dark:border-dark-3 dark:bg-dark-2 lg:px-4 xl:px-6"
        >
          <span className="title mb-[6px] block text-base font-semibold text-dark dark:text-white">
            {title}
          </span>
          <span className="block text-sm text-dark dark:text-white">
            {subtitle}
            {address1} <br />
            {address2}
          </span>
        </label>
      </div>
    </div>
  );
};
