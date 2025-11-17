import React from "react";

const Popover6 = () => {
  return (
    <section className="flex min-h-screen items-center bg-gray-2 py-20 dark:bg-dark lg:py-[120px]">
      <div className="mx-auto w-full px-4 lg:container">
        <div className="group relative block pt-2 lg:inline-block">
          <a
            href="/#"
            className="mb-3 inline-block text-base font-medium text-dark underline dark:text-white"
          >
            Popover Text
          </a>
          <div className="invisible absolute left-0 top-full w-full opacity-0 group-hover:visible group-hover:opacity-100 sm:w-[550px] lg:left-full lg:top-1/2 lg:-translate-y-1/2">
            <div className="relative rounded-md bg-white p-[30px] text-left shadow-testimonial-6 dark:bg-dark-2 dark:shadow-box-dark lg:ml-5">
              <span className="absolute -left-3 top-1/2 hidden -translate-y-1/2 text-white dark:text-dark-2 lg:block">
                <svg
                  width={13}
                  height={21}
                  viewBox="0 0 11 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="fill-current"
                >
                  <path d="M1.58026 12.7577C0.214281 11.5625 0.214281 9.4375 1.58026 8.24227L11 -5.24537e-07L11 21L1.58026 12.7577Z" />
                </svg>
              </span>

              <div className="mb-7 items-center justify-between sm:flex">
                <a href="/#" className="mb-4 inline-block sm:mb-0">
                  <img
                    src="https://cdn.tailgrids.com/2.0/image/assets/images/logo/logo-primary.svg"
                    alt="logo"
                    className="h-8 dark:hidden"
                  />
                  <img
                    src="https://cdn.tailgrids.com/2.0/image/assets/images/logo/logo-white.svg"
                    alt="logo"
                    className="hidden h-8 dark:block"
                  />
                </a>
                <h4 className="text-xl font-semibold text-dark dark:text-white">
                  Welcome To Pimjo Labs
                </h4>
              </div>

              <p className="text-base text-body-color dark:text-dark-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
                facilisis congue justo nec facilisis. Quisque quis augue ipsum.
                Aliquam suscipit dui ac dui commodo.
              </p>
              <div></div>

              <div className="mt-8 flex flex-col-reverse items-center justify-between gap-5 xs:flex-row">
                <div className="flex items-center space-x-2">
                  <button className="block h-[10px] w-[10px] rounded-full bg-[#E4E4E4] hover:bg-primary dark:bg-dark-3"></button>
                  <button className="block h-[10px] w-[10px] rounded-full bg-[#E4E4E4] hover:bg-primary dark:bg-dark-3"></button>
                  <button className="block h-[10px] w-[10px] rounded-full bg-[#E4E4E4] hover:bg-primary dark:bg-dark-3"></button>
                </div>

                <div className="flex items-center gap-5">
                  <button className="text-base font-medium text-body-color hover:text-primary dark:text-dark-6">
                    Skip Intro
                  </button>
                  <button className="rounded-md bg-primary px-5 py-2 text-base font-medium text-white hover:bg-blue-dark">
                    Next Step
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Popover6;
