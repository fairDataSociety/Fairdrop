import React, { useState, useCallback } from 'react'
import styles from './Stepper.module.css'
import c from 'classnames'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import Text from '../../atoms/text/Text'

const Stepper = ({ className, steps, initialStep = 0 }) => {
  const [currentStep, setCurrentStep] = useState(initialStep)

  const nextStep = useCallback(() => {
    if (currentStep + 1 > steps.length - 1) {
      return
    }

    setCurrentStep(currentStep + 1)
  }, [currentStep, steps.length])

  const prevStep = useCallback(() => {
    if (currentStep - 1 < 0) {
      return
    }

    setCurrentStep(currentStep - 1)
  }, [currentStep])

  return (
    <div className={c(styles.container, className)}>
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={currentStep}
          addEndListener={(node, done) => {
            node.addEventListener('transitionend', done, false)
          }}
          classNames="fade"
        >
          <div className={styles.content}>
            {steps[currentStep] &&
              React.cloneElement(steps[currentStep].Component, {
                nextStep,
                prevStep,
              })}
          </div>
        </CSSTransition>
      </SwitchTransition>
      <div className={styles.footer}>
        {steps.map(({ label }, idx) => {
          return (
            <div
              key={idx}
              className={c(styles.indicatorWrapper, idx <= currentStep && styles.indicatorWrapperComplete)}
            >
              <span className={styles.indicator} />
              <Text
                className={c(styles.indicatorLabel, idx === currentStep && styles.indicatorLabelActive)}
                size="ml"
                element="span"
              >
                {idx + 1} {label}
              </Text>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(Stepper)
