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
        <h1 className="">
          {children}
        </h1>
      ) : (
        <p
          className={`
            ${ size ||
              (isSubHeader
                ? ""
                : "")
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
