import React from "react";

type TypographyPropTypes = {
  children: React.ReactNode;
  isHeader?: boolean;
  isSubHeader?: boolean;
  size?: string;
  additionalClasses?: string;
};

export default function Typography({
  children,
  isHeader,
  isSubHeader,
  size,
  additionalClasses
}: TypographyPropTypes) {
  return (
    <>
      {isHeader ? (
        <h1 className="text-2xl sm:text-[2rem]">
          {children}
        </h1>
      ) : (
        <p
          className={`
            ${ size ||
              (isSubHeader
                ? "text-xl sm:text-2xl"
                : "text-base")
            }
            ${additionalClasses}
          `}
        >
          {children}
        </p>
      )}
    </>
  );
}
