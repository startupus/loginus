import React from "react";

const ShoppingCart4 = () => {
  return (
    <section className="bg-white py-20 lg:py-[120px]">
      <div className="container mx-auto">
        <h2 className="mb-12 text-2xl font-semibold text-black sm:text-3xl md:text-4xl xl:mb-16">
          Shopping cart
        </h2>
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-8/12">
            <div className="mb-5 space-y-10">
              <CartItem
                img="https://cdn.tailgrids.com/1.0/assets/images/ecommerce/shopping-carts/shopping-cart-04/image-01.jpg"
                link="/#"
                title="Trendy Skirt Set for Women"
                color="Color: Blue"
                size="Size: S"
                price="$39.50"
                stock
              />
              <CartItem
                img="https://cdn.tailgrids.com/1.0/assets/images/ecommerce/shopping-carts/shopping-cart-04/image-02.jpg"
                link="/#"
                title="Trendy Men's Sneakers"
                color="Color: White"
                size="Size: L"
                price="$99.50"
                stock
              />
            </div>
          </div>

          <div className="w-full px-4 lg:w-4/12">
            <div className="2xl:pl-8">
              <div>
                <h3 className="mb-5 text-xl font-bold text-black">
                  Apply Coupon to get discount!
                </h3>
                <form className="flex">
                  <input
                    type="email"
                    className="outline-hidden mb-3 mr-3 h-[48px] w-full border border-form-stroke bg-white px-5 text-base font-medium text-body-color focus:border-primary focus-visible:shadow-none"
                    placeholder="Coupon code"
                  />
                  <button className="mb-3 h-[48px] bg-primary px-6 text-base font-medium text-white transition hover:bg-primary/90">
                    Submit
                  </button>
                </form>
              </div>
              <div className="-mx-1 border-b border-[#e7e7e7] py-7">
                <div className="mb-3 flex items-center justify-between">
                  <div className="px-1">
                    <p className="text-base font-semibold text-black">
                      Subtotal
                    </p>
                  </div>
                  <div className="px-1">
                    <p className="text-base font-semibold text-black">$96.00</p>
                  </div>
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="px-1">
                    <p className="text-base font-medium text-black">
                      Shipping Cost (+)
                    </p>
                  </div>
                  <div className="px-1">
                    <p className="text-base font-semibold text-black">$14.00</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="px-1">
                    <p className="text-base font-medium text-black">
                      Discount (-)
                    </p>
                  </div>
                  <div className="px-1">
                    <p className="text-base font-semibold text-black">$9.00</p>
                  </div>
                </div>
              </div>
              <div className="-mx-1 flex items-center justify-between pb-6 pt-5">
                <div className="px-1">
                  <p className="text-base font-medium text-black">
                    Estimated Total
                  </p>
                </div>
                <div className="px-1">
                  <p className="text-base font-semibold text-black">$110.00</p>
                </div>
              </div>
              <div className="mb-5">
                <button className="flex w-full items-center justify-center bg-primary px-10 py-[10px] text-center text-base font-normal text-white hover:bg-primary/90">
                  Checkout
                </button>
              </div>
              <p className="text-center text-base font-medium text-body-color">
                You're $10.05 away from free shipping!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShoppingCart4;

const CartItem = ({ img, link, title, size, color, price, stock }) => {
  return (
    <div className="justify-between border-b border-[#e7e7e7] pb-10 last:border-none md:flex">
      <div className="mb-6 mr-7 h-[180px] w-full max-w-[150px] md:mb-0">
        <img
          src={img}
          alt="product"
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="flex w-full flex-col justify-between">
        <div className="mb-4 w-full justify-between sm:flex">
          <div className="mb-4 mr-4">
            <h3>
              <a
                href={link}
                className="block text-lg font-semibold text-black hover:text-primary sm:text-xl"
              >
                {title}
              </a>
            </h3>
            <p className="text-base font-medium text-body-color">{color}</p>
            <p className="text-base font-medium text-body-color">{size}</p>
            <p className="text-base font-medium text-secondary">{stock}</p>
          </div>
          <div className="mb-4 mr-4">
            <p className="mb-1 text-base font-medium text-black">Each</p>
            <p className="text-xl font-semibold text-black">{price}</p>
          </div>
          <div className="mr-4">
            <label className="mb-1 block text-base font-medium text-black">
              Quantity
            </label>
            <div className="relative inline-block">
              <select className="outline-hidden w-full appearance-none border border-form-stroke py-1 pl-4 pr-7 text-sm font-semibold text-body-color transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-[#F5F7FD]">
                <option value="">1</option>
                <option value="">2</option>
                <option value="">3</option>
                <option value="">4</option>
              </select>
              <span className="absolute right-4 top-1/2 mt-[-2px] h-2 w-2 -translate-y-1/2 rotate-45 border-b-[1.5px] border-r-[1.5px] border-body-color"></span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="border border-body-color px-4 py-1 text-sm font-medium text-body-color transition hover:border-primary hover:bg-primary hover:text-white">
            Edit
          </button>
          <button className="hover:border-danger hover:bg-danger border border-body-color px-4 py-1 text-sm font-medium text-body-color transition hover:text-white">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
